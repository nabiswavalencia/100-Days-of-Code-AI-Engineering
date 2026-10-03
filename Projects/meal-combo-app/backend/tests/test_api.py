import pytest
from fastapi.testclient import TestClient

import db
from app import app
from menu import MENU

client = TestClient(app)


def test_menu_endpoint(temp_db):
    response = client.get("/api/menu")
    assert response.status_code == 200
    assert response.json() == MENU


def test_recommend_endpoint(temp_db):
    response = client.get("/api/recommend", params={"budget": 150})
    assert response.status_code == 200
    top = response.json()[0]
    assert [item["id"] for item in top["items"]] == ["chapati-beans", "chai"]
    assert top["total"] == 140


def test_recommend_accepts_repeated_history_params(temp_db):
    response = client.get("/api/recommend?budget=1000&history=pilau&history=chai&limit=10")
    ids = [item["id"] for combo in response.json() for item in combo["items"]]
    assert "pilau" not in ids and "chai" not in ids


@pytest.mark.parametrize(
    "query",
    ["", "budget=-5", "budget=150.5", "budget=abc", "budget=300&limit=0", "budget=300&limit=11"],
)
def test_recommend_rejects_bad_input(temp_db, query):
    assert client.get(f"/api/recommend?{query}").status_code == 422


def test_order_is_saved_and_changes_the_menu(temp_db):
    before = client.get("/api/menu").json()["main"][1]["purchases"]  # pilau

    response = client.post("/api/orders", json={"item_ids": ["pilau", "chai"]})

    assert response.status_code == 201
    assert response.json() == {"order_id": 1}
    assert client.get("/api/menu").json()["main"][1]["purchases"] == before + 1


def test_order_with_unknown_item_is_400(temp_db):
    response = client.post("/api/orders", json={"item_ids": ["burger"]})
    assert response.status_code == 400


@pytest.mark.parametrize("body", [{"item_ids": []}, {}, {"item_ids": "pilau"}])
def test_order_with_bad_body_is_422(temp_db, body):
    assert client.post("/api/orders", json=body).status_code == 422


def test_missing_database_gives_503_with_instructions(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "nope.db")
    response = client.get("/api/menu")
    assert response.status_code == 503
    assert "setup_db.py" in response.json()["detail"]
