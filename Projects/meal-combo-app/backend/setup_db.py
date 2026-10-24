"""Creates meals.db and fills it from the seed data in seed_data.py.

Run this once before starting app.py (running it again resets the database):
    python setup_db.py
"""
from db import DB_PATH, init_db
from seed_data import ORDERS, RESTAURANTS, USERS

if __name__ == "__main__":
    count = init_db(RESTAURANTS, USERS, ORDERS)
    print(f"Created {DB_PATH} with {len(RESTAURANTS)} restaurants, {count} menu items, "
          f"{len(USERS)} users and {len(ORDERS)} past orders.")
