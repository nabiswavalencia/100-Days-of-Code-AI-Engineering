import sqlite3

import pytest

import db
from menu import MENU


def purchases(item_id):
    return next(
        item["purchases"]
        for options in db.load_menu().values()
        for item in options
        if item["id"] == item_id
    )


def test_load_menu_returns_seed_data_grouped_by_slot(temp_db):
    assert db.load_menu() == MENU


def test_record_order_saves_order_and_items(temp_db):
    order_id = db.record_order(["pilau", "chai"])

    with sqlite3.connect(temp_db) as connection:
        saved = connection.execute(
            "SELECT item_id FROM order_items WHERE order_id = ? ORDER BY item_id", (order_id,)
        ).fetchall()
    assert saved == [("chai",), ("pilau",)]


def test_record_order_increments_purchases(temp_db):
    before = purchases("pilau")
    db.record_order(["pilau", "chai"])
    db.record_order(["pilau"])
    assert purchases("pilau") == before + 2


def test_order_ids_go_up(temp_db):
    first = db.record_order(["pilau"])
    second = db.record_order(["chai"])
    assert second == first + 1


def test_unknown_item_is_rejected_and_nothing_is_saved(temp_db):
    before = purchases("pilau")
    with pytest.raises(ValueError):
        db.record_order(["pilau", "burger"])

    assert purchases("pilau") == before
    with sqlite3.connect(temp_db) as connection:
        assert connection.execute("SELECT COUNT(*) FROM orders").fetchone()[0] == 0


def test_same_item_twice_in_one_order_counts_twice(temp_db):
    before = purchases("chai")
    db.record_order(["chai", "chai"])
    assert purchases("chai") == before + 2


def test_init_db_resets_everything(temp_db):
    db.record_order(["pilau"])
    db.init_db(MENU)
    assert db.load_menu() == MENU


def test_missing_database_raises_a_clear_error(tmp_path, monkeypatch):
    missing = tmp_path / "nope.db"
    monkeypatch.setattr(db, "DB_PATH", missing)

    with pytest.raises(db.DatabaseMissingError, match="setup_db.py"):
        db.load_menu()
    assert not missing.exists()  # it must not leave an empty file behind
