"""Day 44: "skip what you had recently" comes from the database, using a 24-hour window."""
from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

import db
from app import app
from conftest import FIXED_NOW
from seed_data import ORDERS, RESTAURANTS, USERS

client = TestClient(app)


# ---------- db.recent_item_ids ----------

def test_yesterdays_lunch_is_recent(fixed_time_db):
    # Achieng's last order was yesterday at 13:15 Nairobi time: 22 hours 45 minutes ago
    assert db.recent_item_ids("achieng", "mama-wanjiku") == ["mw-chai", "mw-githeri", "mw-kachumbari"]


def test_older_orders_are_not_recent(fixed_time_db):
    # Her Chapati & Beans order was 2 days ago, so it's not skipped
    assert "mw-chapati-beans" not in db.recent_item_ids("achieng", "mama-wanjiku")


def test_every_order_in_the_window_counts_not_just_the_last(fixed_time_db):
    # Fatuma ordered twice at Moto last night. v2 only skipped the last one; both count now.
    assert db.recent_item_ids("fatuma", "moto") == [
        "mt-chicken", "mt-chips", "mt-mango", "mt-soda", "mt-tikka-pizza",
    ]


def test_a_wider_window_reaches_further_back(fixed_time_db):
    assert "mw-chapati-beans" in db.recent_item_ids("achieng", "mama-wanjiku", hours=48)


def test_nothing_recent_gives_an_empty_list(fixed_time_db):
    # Achieng's Moto order was 6 days ago
    assert db.recent_item_ids("achieng", "moto") == []


def test_only_this_restaurant_counts(fixed_time_db):
    assert all(item.startswith("mw-") for item in db.recent_item_ids("achieng", "mama-wanjiku"))


def test_a_new_order_is_recent_straight_away(fixed_time_db):
    db.record_order("achieng", "moto", ["mt-burger", "mt-soda"])
    assert db.recent_item_ids("achieng", "moto") == ["mt-burger", "mt-soda"]


def test_an_order_just_over_24_hours_ago_drops_out(fixed_time_db):
    later = FIXED_NOW + timedelta(hours=2)  # yesterday's 13:15 lunch is now 24h45m ago
    assert db.recent_item_ids("achieng", "mama-wanjiku", now=later) == []


# ---------- seed times ----------

def test_seed_hours_are_nairobi_time_stored_as_utc(fixed_time_db):
    latest = db.list_orders("achieng", "mama-wanjiku")[0]
    assert latest["created_at"] == "2026-10-06T10:15:00+00:00"  # 13:15 in Nairobi


def test_no_seeded_order_is_in_the_future(tmp_path, monkeypatch):
    # 07:00 in Nairobi, before Brian's 08:15 "today" breakfast
    early = datetime(2026, 10, 7, 4, 0, tzinfo=timezone.utc)
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "t.db")
    db.init_db(RESTAURANTS, USERS, ORDERS, now=early)

    for user in USERS:
        for order in db.list_orders(user["id"]):
            assert order["created_at"] <= early.isoformat(timespec="seconds")
    assert db.list_orders("brian", "kahawa-house")[0]["created_at"] == "2026-10-07T03:30:00+00:00"


# ---------- the endpoint ----------

def test_recent_items_endpoint(fixed_time_db):
    response = client.get("/api/users/achieng/recent-items", params={"restaurant": "mama-wanjiku"})
    assert response.status_code == 200
    assert response.json() == {"hours": 24, "item_ids": ["mw-chai", "mw-githeri", "mw-kachumbari"]}


def test_recent_items_endpoint_takes_hours(fixed_time_db):
    response = client.get("/api/users/achieng/recent-items?restaurant=mama-wanjiku&hours=48")
    assert "mw-chapati-beans" in response.json()["item_ids"]


def test_recent_items_needs_a_restaurant(fixed_time_db):
    assert client.get("/api/users/achieng/recent-items").status_code == 422


def test_recent_items_rejects_bad_hours(fixed_time_db):
    for hours in (0, 169, "abc"):
        url = f"/api/users/achieng/recent-items?restaurant=mama-wanjiku&hours={hours}"
        assert client.get(url).status_code == 422


def test_recent_items_unknown_user_or_restaurant_is_404(fixed_time_db):
    assert client.get("/api/users/ghost/recent-items?restaurant=moto").status_code == 404
    assert client.get("/api/users/achieng/recent-items?restaurant=nowhere").status_code == 404
