"""Creates meals.db and fills the items table from the seed data in menu.py.

Run this once before starting app.py (running it again resets the database):
    python setup_db.py
"""
import sqlite3

from db import DB_PATH
from menu import MENU

connection = sqlite3.connect(DB_PATH)
connection.executescript(
    """
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
)

rows = [
    (item["id"], item["name"], slot, item["price"], item["rating"], item["purchases"])
    for slot, options in MENU.items()
    for item in options
]
connection.executemany(
    "INSERT INTO items (id, name, slot, price, rating, purchases) VALUES (?, ?, ?, ?, ?, ?)",
    rows,
)
connection.commit()
connection.close()

print(f"Created {DB_PATH} with {len(rows)} menu items.")
