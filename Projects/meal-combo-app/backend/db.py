import sqlite3
from contextlib import closing, contextmanager
from pathlib import Path

DB_PATH = Path(__file__).parent / "meals.db"

SLOT_ORDER = ("main", "side", "drink")

SCHEMA = """
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS items;

CREATE TABLE items (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    slot      TEXT NOT NULL,      -- main, side or drink
    price     INTEGER NOT NULL,   -- KES
    rating    REAL NOT NULL,
    purchases INTEGER NOT NULL DEFAULT 0
);

-- One row per order, and one order_items row per dish in that order.
-- This is the data a machine learning model can learn from later.
CREATE TABLE orders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    order_id INTEGER NOT NULL REFERENCES orders(id),
    item_id  TEXT NOT NULL REFERENCES items(id)
);
"""


class DatabaseMissingError(Exception):
    """Raised when meals.db hasn't been created yet."""


@contextmanager
def connect():
    """Opens the database, commits if everything worked, and always closes it.

    (A plain `with sqlite3.connect(...)` commits but never closes the connection.)
    """
    # Checked first because sqlite3.connect would silently create an empty file.
    if not DB_PATH.exists():
        raise DatabaseMissingError("Database not found. Run `python setup_db.py` first.")

    with closing(sqlite3.connect(DB_PATH)) as connection:
        connection.row_factory = sqlite3.Row  # rows behave like dicts: row["price"]
        with connection:  # commit on success, roll back on error
            yield connection


def init_db(menu):
    """Creates (or resets) the tables and fills items from `menu`. Returns the item count."""
    rows = [
        (item["id"], item["name"], slot, item["price"], item["rating"], item["purchases"])
        for slot, options in menu.items()
        for item in options
    ]
    with closing(sqlite3.connect(DB_PATH)) as connection:
        connection.executescript(SCHEMA)
        connection.executemany(
            "INSERT INTO items (id, name, slot, price, rating, purchases) VALUES (?, ?, ?, ?, ?, ?)",
            rows,
        )
        connection.commit()
    return len(rows)


def load_menu():
    """Reads every item and groups it by slot: {"main": [...], "side": [...], "drink": [...]}."""
    with connect() as connection:
        rows = connection.execute(
            "SELECT id, name, slot, price, rating, purchases FROM items ORDER BY rowid"
        ).fetchall()

    menu = {slot: [] for slot in SLOT_ORDER}
    for row in rows:
        item = dict(row)
        menu[item.pop("slot")].append(item)
    return menu


def record_order(item_ids):
    """Saves an order and adds 1 to each item's purchase count. Returns the new order id.

    Raises ValueError if any id isn't on the menu.
    """
    with connect() as connection:
        unique_ids = set(item_ids)
        placeholders = ", ".join("?" for _ in unique_ids)
        found = connection.execute(
            f"SELECT COUNT(*) FROM items WHERE id IN ({placeholders})", list(unique_ids)
        ).fetchone()[0]
        if found != len(unique_ids):
            raise ValueError("Unknown item id in order.")

        order_id = connection.execute("INSERT INTO orders DEFAULT VALUES").lastrowid
        connection.executemany(
            "INSERT INTO order_items (order_id, item_id) VALUES (?, ?)",
            [(order_id, item_id) for item_id in item_ids],
        )
        connection.executemany(
            "UPDATE items SET purchases = purchases + 1 WHERE id = ?",
            [(item_id,) for item_id in item_ids],
        )
    return order_id
