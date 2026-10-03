"""Creates meals.db and fills the items table from the seed data in menu.py.

Run this once before starting app.py (running it again resets the database):
    python setup_db.py
"""
from db import DB_PATH, init_db
from menu import MENU

if __name__ == "__main__":
    count = init_db(MENU)
    print(f"Created {DB_PATH} with {count} menu items.")
