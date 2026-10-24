import json
import sqlite3
from contextlib import closing, contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "meals.db"

SLOT_ORDER = ("main", "side", "drink")

# Kenya is UTC+3 all year (no daylight saving). Seed order hours are Nairobi time.
NAIROBI = timezone(timedelta(hours=3), "EAT")

SCHEMA = """
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS specials;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS restaurants;

CREATE TABLE restaurants (
    id             TEXT PRIMARY KEY,   -- url slug, e.g. mama-wanjiku
    name           TEXT NOT NULL,
    kind           TEXT NOT NULL,
    area           TEXT NOT NULL,
    tagline        TEXT NOT NULL,
    quote          TEXT NOT NULL,
    quote_by       TEXT NOT NULL,
    hero_image     TEXT,
    presets        TEXT NOT NULL,      -- JSON list of quick budgets
    default_budget INTEGER NOT NULL
);

CREATE TABLE items (
    id            TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL REFERENCES restaurants(id),
    name          TEXT NOT NULL,
    slot          TEXT NOT NULL,      -- main, side or drink
    price         INTEGER NOT NULL,   -- KES
    rating        REAL NOT NULL,
    purchases     INTEGER NOT NULL DEFAULT 0,
    image         TEXT
);

CREATE TABLE specials (
    restaurant_id TEXT NOT NULL REFERENCES restaurants(id),
    item_id       TEXT NOT NULL REFERENCES items(id),
    price         INTEGER,            -- discounted price, or NULL for "no discount"
    note          TEXT NOT NULL
);

CREATE TABLE users (
    id      TEXT PRIMARY KEY,
    name    TEXT NOT NULL,
    profile TEXT NOT NULL
);

-- One row per order, and one order_items row per dish in that order.
-- This is the data a machine learning model can learn from later.
CREATE TABLE orders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       TEXT NOT NULL REFERENCES users(id),
    restaurant_id TEXT NOT NULL REFERENCES restaurants(id),
    created_at    TEXT NOT NULL,      -- ISO 8601, UTC
    total         INTEGER NOT NULL,
    payment       TEXT NOT NULL DEFAULT 'M-Pesa'
);

CREATE TABLE order_items (
    order_id INTEGER NOT NULL REFERENCES orders(id),
    item_id  TEXT NOT NULL REFERENCES items(id),
    price    INTEGER NOT NULL         -- price at the time of the order
);
"""


class DatabaseMissingError(Exception):
    """Raised when meals.db hasn't been created yet."""


class NotFoundError(Exception):
    """Raised when a restaurant or user id doesn't exist."""


@contextmanager
def connect():
    """Opens the database, commits if everything worked, and always closes it."""
    # Checked first because sqlite3.connect would silently create an empty file.
    if not DB_PATH.exists():
        raise DatabaseMissingError("Database not found. Run `python setup_db.py` first.")

    with closing(sqlite3.connect(DB_PATH)) as connection:
        connection.row_factory = sqlite3.Row  # rows behave like dicts: row["price"]
        with connection:  # commit on success, roll back on error
            yield connection


def _now():
    return datetime.now(timezone.utc)


def _seed_time(now, days_ago, hour):
    """When a seeded order happened: `hour`:15 Nairobi time, `days_ago` days before `now`, stored in UTC.

    A "today" order whose hour hasn't come yet (setup run at 7am, breakfast at 8am)
    is moved to 30 minutes ago, so no order is ever in the future.
    """
    local = (now.astimezone(NAIROBI) - timedelta(days=days_ago)).replace(
        hour=hour, minute=15, second=0, microsecond=0
    )
    return min(local.astimezone(timezone.utc), now - timedelta(minutes=30))


def init_db(restaurants, users, orders=(), now=None):
    """Creates (or resets) every table and fills it from the seed data. Returns the item count."""
    now = now or _now()
    with closing(sqlite3.connect(DB_PATH)) as connection:
        connection.row_factory = sqlite3.Row
        connection.executescript(SCHEMA)
        item_count = 0
        for r in restaurants:
            connection.execute(
                "INSERT INTO restaurants VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (r["id"], r["name"], r["kind"], r["area"], r["tagline"], r["quote"],
                 r["quote_by"], r.get("hero_image"), json.dumps(r["presets"]), r["default_budget"]),
            )
            for slot, options in r["menu"].items():
                for item in options:
                    connection.execute(
                        "INSERT INTO items VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        (item["id"], r["id"], item["name"], slot, item["price"],
                         item["rating"], item["purchases"], item.get("image")),
                    )
                    item_count += 1
            for special in r.get("specials", []):
                connection.execute(
                    "INSERT INTO specials VALUES (?, ?, ?, ?)",
                    (r["id"], special["item_id"], special["price"], special["note"]),
                )
        connection.executemany(
            "INSERT INTO users VALUES (?, ?, ?)",
            [(u["id"], u["name"], u["profile"]) for u in users],
        )
        for user_id, restaurant_id, days_ago, hour, item_ids in orders:
            when = _seed_time(now, days_ago, hour)
            # Seeded orders are history only: they don't bump purchases, which already include them.
            _insert_order(connection, user_id, restaurant_id, item_ids, when, count_purchase=False)
        connection.commit()
    return item_count


# ---------- Reading ----------

# `price` is what you pay today (the special price if there is one); `regular_price` is the menu price.
_ITEM_COLUMNS = (
    "i.id, i.name, i.slot, COALESCE(s.price, i.price) AS price, i.price AS regular_price, "
    "i.rating, i.purchases, i.image"
)

def _restaurant_row(connection, restaurant_id):
    row = connection.execute("SELECT * FROM restaurants WHERE id = ?", (restaurant_id,)).fetchone()
    if row is None:
        raise NotFoundError(f"No restaurant called '{restaurant_id}'.")
    data = dict(row)
    data["presets"] = json.loads(data["presets"])
    return data


def list_restaurants():
    """Every restaurant with its price range, for the picker page."""
    with connect() as connection:
        rows = connection.execute(
            """SELECT r.id, r.name, r.kind, r.area, r.tagline, r.hero_image,
                      MIN(i.price) AS min_price, MAX(i.price) AS max_price
               FROM restaurants r JOIN items i ON i.restaurant_id = r.id
               GROUP BY r.id ORDER BY r.rowid"""
        ).fetchall()
    return [dict(row) for row in rows]


def get_restaurant(restaurant_id):
    """One restaurant with its specials (each special includes the full item)."""
    with connect() as connection:
        restaurant = _restaurant_row(connection, restaurant_id)
        specials = connection.execute(
            """SELECT s.price AS special_price, s.note, i.id, i.name, i.slot, i.price,
                      i.rating, i.purchases, i.image
               FROM specials s JOIN items i ON i.id = s.item_id
               WHERE s.restaurant_id = ? ORDER BY s.rowid""",
            (restaurant_id,),
        ).fetchall()
    restaurant["specials"] = [
        {"note": s["note"], "special_price": s["special_price"],
         "item": {k: s[k] for k in ("id", "name", "slot", "price", "rating", "purchases", "image")}}
        for s in specials
    ]
    return restaurant


def load_menu(restaurant_id):
    """One restaurant's items grouped by slot: {"main": [...], "side": [...], "drink": [...]}."""
    with connect() as connection:
        _restaurant_row(connection, restaurant_id)
        # A special's price replaces the menu price everywhere: menu, recommendations, orders.
        rows = connection.execute(
            f"""SELECT {_ITEM_COLUMNS} FROM items i LEFT JOIN specials s ON s.item_id = i.id
               WHERE i.restaurant_id = ? ORDER BY i.rowid""",
            (restaurant_id,),
        ).fetchall()

    menu = {slot: [] for slot in SLOT_ORDER}
    for row in rows:
        item = dict(row)
        menu[item.pop("slot")].append(item)
    return menu


def list_users():
    with connect() as connection:
        return [dict(row) for row in connection.execute("SELECT * FROM users ORDER BY rowid")]


def get_user(user_id):
    with connect() as connection:
        row = connection.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise NotFoundError(f"No user called '{user_id}'.")
    return dict(row)


def list_orders(user_id, restaurant_id=None):
    """A user's orders, newest first, each with its items. Optionally for one restaurant only."""
    get_user(user_id)
    with connect() as connection:
        query = "SELECT * FROM orders WHERE user_id = ?"
        params = [user_id]
        if restaurant_id:
            _restaurant_row(connection, restaurant_id)
            query += " AND restaurant_id = ?"
            params.append(restaurant_id)
        orders = [dict(row) for row in connection.execute(query + " ORDER BY created_at DESC, id DESC", params)]
        for order in orders:
            order["items"] = [
                dict(row) for row in connection.execute(
                    """SELECT i.id, i.name, i.image, oi.price FROM order_items oi
                       JOIN items i ON i.id = oi.item_id WHERE oi.order_id = ? ORDER BY oi.rowid""",
                    (order["id"],),
                )
            ]
    return orders


def recent_item_ids(user_id, restaurant_id, hours=24, now=None):
    """Every dish this user ordered at this restaurant in the last `hours` hours (sorted, no repeats).

    This is what "skip what you had recently" means: not just the last order, and nothing older.
    """
    get_user(user_id)
    now = now or _now()
    cutoff = (now - timedelta(hours=hours)).isoformat(timespec="seconds")
    with connect() as connection:
        _restaurant_row(connection, restaurant_id)
        rows = connection.execute(
            """SELECT DISTINCT oi.item_id FROM order_items oi
               JOIN orders o ON o.id = oi.order_id
               WHERE o.user_id = ? AND o.restaurant_id = ? AND o.created_at >= ?
               ORDER BY oi.item_id""",
            (user_id, restaurant_id, cutoff),
        )
        return [row["item_id"] for row in rows]


# ---------- Writing ----------

def _insert_order(connection, user_id, restaurant_id, item_ids, when, count_purchase=True):
    unique_ids = sorted(set(item_ids))
    placeholders = ", ".join("?" for _ in unique_ids)
    prices = {
        row["id"]: row["price"]
        for row in connection.execute(
            f"""SELECT i.id, COALESCE(s.price, i.price) AS price
                FROM items i LEFT JOIN specials s ON s.item_id = i.id
                WHERE i.restaurant_id = ? AND i.id IN ({placeholders})""",
            [restaurant_id, *unique_ids],
        )
    }
    if len(prices) != len(unique_ids):
        raise ValueError("Unknown item id for this restaurant.")

    total = sum(prices[item_id] for item_id in item_ids)
    order_id = connection.execute(
        "INSERT INTO orders (user_id, restaurant_id, created_at, total) VALUES (?, ?, ?, ?)",
        (user_id, restaurant_id, when.astimezone(timezone.utc).isoformat(timespec="seconds"), total),
    ).lastrowid
    connection.executemany(
        "INSERT INTO order_items (order_id, item_id, price) VALUES (?, ?, ?)",
        [(order_id, item_id, prices[item_id]) for item_id in item_ids],
    )
    if count_purchase:
        connection.executemany(
            "UPDATE items SET purchases = purchases + 1 WHERE id = ?",
            [(item_id,) for item_id in item_ids],
        )
    return order_id, total


def record_order(user_id, restaurant_id, item_ids):
    """Saves an order and adds 1 to each item's purchase count. Returns (order id, total).

    Raises NotFoundError for an unknown user or restaurant, and ValueError if any item
    isn't on that restaurant's menu.
    """
    get_user(user_id)
    with connect() as connection:
        _restaurant_row(connection, restaurant_id)
        return _insert_order(connection, user_id, restaurant_id, item_ids, _now())
