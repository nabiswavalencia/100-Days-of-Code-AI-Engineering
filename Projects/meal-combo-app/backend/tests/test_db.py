import sqlite3
from datetime import datetime, timedelta, timezone

import pytest

import db
from seed_data import ORDERS, RESTAURANTS, USERS


def purchases(item_id, restaurant="mama-wanjiku"):
    return next(
        item["purchases"]
        for options in db.load_menu(restaurant).values()
        for item in options
        if item["id"] == item_id
    )


def expected_menu(restaurant):
    """The seed menu as the database serves it: today's special price replaces the menu price."""
    specials = {s["item_id"]: s["price"] for s in restaurant["specials"] if s["price"] is not None}
    return {
        slot: [
            {**item, "price": specials.get(item["id"], item["price"]), "regular_price": item["price"]}
            for item in options
        ]
        for slot, options in restaurant["menu"].items()
    }


# ---------- Reading ----------

@pytest.mark.parametrize("restaurant", RESTAURANTS, ids=lambda r: r["id"])
def test_load_menu_returns_seed_data_grouped_by_slot(temp_db, restaurant):
    assert db.load_menu(restaurant["id"]) == expected_menu(restaurant)


def test_unknown_restaurant_raises_not_found(temp_db):
    with pytest.raises(db.NotFoundError):
        db.load_menu("no-such-place")


def test_list_restaurants_includes_price_range(temp_db):
    restaurants = db.list_restaurants()
    assert len(restaurants) == 4
    kibanda = restaurants[0]
    assert kibanda["id"] == "mama-wanjiku"
    assert (kibanda["min_price"], kibanda["max_price"]) == (30, 180)


def test_get_restaurant_includes_presets_and_specials(temp_db):
    restaurant = db.get_restaurant("moto")
    assert restaurant["presets"] == [600, 1000, 1500]
    first = restaurant["specials"][0]
    assert first["item"]["name"] == "Two-Piece Fried Chicken"
    assert first["special_price"] == 450


def test_three_demo_users(temp_db):
    assert [u["id"] for u in db.list_users()] == ["achieng", "brian", "fatuma"]


def test_seeded_orders_are_per_user_and_newest_first(temp_db):
    orders = db.list_orders("achieng", "mama-wanjiku")
    assert len(orders) == 3
    assert orders[0]["created_at"] > orders[1]["created_at"]
    assert [i["id"] for i in orders[0]["items"]] == ["mw-githeri", "mw-kachumbari", "mw-chai"]
    assert orders[0]["total"] == 150


def test_orders_without_restaurant_filter_cover_every_restaurant(temp_db):
    restaurants = {o["restaurant_id"] for o in db.list_orders("achieng")}
    assert restaurants == {"mama-wanjiku", "moto"}


def test_seeded_orders_use_relative_dates(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "t.db")
    now = datetime(2026, 10, 7, 9, 0, tzinfo=timezone.utc)
    db.init_db(RESTAURANTS, USERS, ORDERS, now=now)
    latest = db.list_orders("achieng", "mama-wanjiku")[0]
    assert latest["created_at"].startswith((now - timedelta(days=1)).date().isoformat())


# ---------- Writing ----------

def test_record_order_saves_order_items_and_total(temp_db):
    order_id, total = db.record_order("achieng", "mama-wanjiku", ["mw-pilau", "mw-chai"])
    assert total == 180  # Pilau is on special at 150 (menu price 170)

    with sqlite3.connect(temp_db) as connection:
        saved = connection.execute(
            "SELECT item_id, price FROM order_items WHERE order_id = ? ORDER BY item_id", (order_id,)
        ).fetchall()
    assert saved == [("mw-chai", 30), ("mw-pilau", 150)]
    assert db.list_orders("achieng", "mama-wanjiku")[0]["id"] == order_id


def test_record_order_increments_purchases(temp_db):
    before = purchases("mw-pilau")
    db.record_order("achieng", "mama-wanjiku", ["mw-pilau", "mw-chai"])
    db.record_order("brian", "mama-wanjiku", ["mw-pilau"])
    assert purchases("mw-pilau") == before + 2


def test_special_price_is_used_on_the_menu(temp_db):
    pilau = db.load_menu("mama-wanjiku")["main"][1]
    assert (pilau["price"], pilau["regular_price"]) == (150, 170)
    githeri = db.load_menu("mama-wanjiku")["main"][3]  # a special without a discount
    assert githeri["price"] == githeri["regular_price"] == 90


def test_order_ids_go_up(temp_db):
    first, _ = db.record_order("achieng", "mama-wanjiku", ["mw-pilau"])
    second, _ = db.record_order("achieng", "mama-wanjiku", ["mw-chai"])
    assert second == first + 1


def test_item_from_another_restaurant_is_rejected_and_nothing_is_saved(temp_db):
    before = purchases("mw-pilau")
    count_before = len(db.list_orders("achieng"))
    with pytest.raises(ValueError):
        db.record_order("achieng", "mama-wanjiku", ["mw-pilau", "mt-burger"])

    assert purchases("mw-pilau") == before
    assert len(db.list_orders("achieng")) == count_before


def test_unknown_user_is_rejected(temp_db):
    with pytest.raises(db.NotFoundError):
        db.record_order("nobody", "mama-wanjiku", ["mw-pilau"])


def test_same_item_twice_in_one_order_counts_twice(temp_db):
    before = purchases("mw-chai")
    _, total = db.record_order("achieng", "mama-wanjiku", ["mw-chai", "mw-chai"])
    assert purchases("mw-chai") == before + 2
    assert total == 60


def test_init_db_resets_everything(temp_db):
    db.record_order("achieng", "mama-wanjiku", ["mw-pilau"])
    db.init_db(RESTAURANTS, USERS, ORDERS)
    assert db.load_menu("mama-wanjiku") == expected_menu(RESTAURANTS[0])
    assert len(db.list_orders("achieng", "mama-wanjiku")) == 3


def test_missing_database_raises_a_clear_error(tmp_path, monkeypatch):
    missing = tmp_path / "nope.db"
    monkeypatch.setattr(db, "DB_PATH", missing)

    with pytest.raises(db.DatabaseMissingError, match="setup_db.py"):
        db.load_menu("mama-wanjiku")
    assert not missing.exists()  # it must not leave an empty file behind
