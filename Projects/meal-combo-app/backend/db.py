import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "meals.db"

SLOT_ORDER = ("main", "side", "drink")


def connect():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row  # rows behave like dicts: row["price"]
    return connection


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
        placeholders = ", ".join("?" for _ in item_ids)
        found = connection.execute(
            f"SELECT COUNT(*) FROM items WHERE id IN ({placeholders})", item_ids
        ).fetchone()[0]
        if found != len(set(item_ids)):
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
