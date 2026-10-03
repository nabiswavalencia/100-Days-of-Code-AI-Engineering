import pytest

import db
from menu import MENU


@pytest.fixture
def temp_db(tmp_path, monkeypatch):
    """Points the app at a fresh database in a temporary folder, so tests never touch meals.db."""
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    db.init_db(MENU)
    return db.DB_PATH
