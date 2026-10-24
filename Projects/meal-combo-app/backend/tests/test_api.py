import pytest
from fastapi.testclient import TestClient

import db
from app import app

client = TestClient(app)
KIBANDA = "/api/restaurants/mama-wanjiku"


def order(item_ids, user_id="achieng", restaurant_id="mama-wanjiku"):
    return client.post(
        "/api/orders", json={"user_id": user_id, "restaurant_id": restaurant_id, "item_ids": item_ids}
    )


def test_users_endpoint(temp_db):
    assert [u["name"] for u in client.get("/api/users").json()] == [
        "Achieng Otieno", "Brian Kiprono", "Fatuma Hassan",
    ]


def test_login_with_known_user(temp_db):
    response = client.post("/api/login", json={"user_id": "brian"})
    assert response.status_code == 200
    assert response.json()["name"] == "Brian Kiprono"


def test_login_with_unknown_user_is_404(temp_db):
    assert client.post("/api/login", json={"user_id": "mallory"}).status_code == 404


def test_restaurants_endpoint(temp_db):
    names = [r["name"] for r in client.get("/api/restaurants").json()]
    assert names == ["Mama Wanjiku’s Kibanda", "Kahawa House", "The Baobab Room", "Moto Pizza & Chicken"]


def test_restaurant_endpoint_has_specials(temp_db):
    body = client.get(KIBANDA).json()
    assert body["quote_by"] == "Mama Wanjiku, owner"
    assert body["specials"][0]["special_price"] == 150


def test_unknown_restaurant_is_404(temp_db):
    assert client.get("/api/restaurants/nope/menu").status_code == 404


def test_menu_endpoint(temp_db):
    menu = client.get(f"{KIBANDA}/menu").json()
    assert list(menu) == ["main", "side", "drink"]
    assert menu["main"][1]["name"] == "Pilau"


def test_recommend_endpoint(temp_db):
    response = client.get(f"{KIBANDA}/recommend", params={"budget": 150})
    assert response.status_code == 200
    top = response.json()[0]
    assert [item["id"] for item in top["items"]] == ["mw-chapati-beans", "mw-chai"]
    assert top["total"] == 140


def test_recommend_uses_only_that_restaurants_menu(temp_db):
    combos = client.get("/api/restaurants/moto/recommend?budget=5000&limit=10").json()
    assert all(item["id"].startswith("mt-") for combo in combos for item in combo["items"])


def test_recommend_accepts_repeated_history_params(temp_db):
    response = client.get(f"{KIBANDA}/recommend?budget=1000&history=mw-pilau&history=mw-chai&limit=10")
    ids = [item["id"] for combo in response.json() for item in combo["items"]]
    assert "mw-pilau" not in ids and "mw-chai" not in ids


@pytest.mark.parametrize(
    "query",
    ["", "budget=-5", "budget=150.5", "budget=abc", "budget=300&limit=0", "budget=300&limit=11"],
)
def test_recommend_rejects_bad_input(temp_db, query):
    assert client.get(f"{KIBANDA}/recommend?{query}").status_code == 422


def test_user_orders_endpoint_filters_by_restaurant(temp_db):
    orders = client.get("/api/users/fatuma/orders", params={"restaurant": "moto"}).json()
    assert len(orders) == 3
    assert all(o["restaurant_id"] == "moto" for o in orders)


def test_orders_for_unknown_user_is_404(temp_db):
    assert client.get("/api/users/ghost/orders").status_code == 404


def test_order_is_saved_and_changes_the_menu(temp_db):
    before = client.get(f"{KIBANDA}/menu").json()["main"][1]["purchases"]  # pilau

    response = order(["mw-pilau", "mw-chai"])

    assert response.status_code == 201
    assert response.json()["total"] == 180  # Pilau special 150 + Chai 30
    assert client.get(f"{KIBANDA}/menu").json()["main"][1]["purchases"] == before + 1
    assert client.get("/api/users/achieng/orders?restaurant=mama-wanjiku").json()[0]["total"] == 180


def test_order_with_item_from_another_restaurant_is_400(temp_db):
    assert order(["mt-burger"]).status_code == 400


def test_order_for_unknown_user_is_404(temp_db):
    assert order(["mw-pilau"], user_id="ghost").status_code == 404


@pytest.mark.parametrize(
    "body",
    [
        {"user_id": "achieng", "restaurant_id": "mama-wanjiku", "item_ids": []},
        {},
        {"user_id": "achieng", "restaurant_id": "mama-wanjiku", "item_ids": "mw-pilau"},
        {"item_ids": ["mw-pilau"]},
    ],
)
def test_order_with_bad_body_is_422(temp_db, body):
    assert client.post("/api/orders", json=body).status_code == 422


def test_missing_database_gives_503_with_instructions(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "nope.db")
    response = client.get(f"{KIBANDA}/menu")
    assert response.status_code == 503
    assert "setup_db.py" in response.json()["detail"]
