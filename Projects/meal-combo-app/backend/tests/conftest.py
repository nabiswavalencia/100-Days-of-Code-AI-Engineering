from datetime import datetime, timezone

import pytest

import db
from seed_data import ORDERS, RESTAURANTS, USERS


@pytest.fixture
def temp_db(tmp_path, monkeypatch):
    """Points the app at a fresh database in a temporary folder, so tests never touch meals.db."""
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    db.init_db(RESTAURANTS, USERS, ORDERS)
    return db.DB_PATH


# Tuesday 7 Oct 2026, 12:00 in Nairobi (09:00 UTC). Used where the answer depends on the time.
FIXED_NOW = datetime(2026, 10, 7, 9, 0, tzinfo=timezone.utc)


@pytest.fixture
def fixed_time_db(tmp_path, monkeypatch):
    """Like temp_db, but seeded at FIXED_NOW and with the app's clock frozen there."""
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    monkeypatch.setattr(db, "_now", lambda: FIXED_NOW)
    db.init_db(RESTAURANTS, USERS, ORDERS, now=FIXED_NOW)
    return db.DB_PATH
