from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

import db
from engine import recommend

app = FastAPI(title="Chakula Combos v2")


class Order(BaseModel):
    user_id: str
    restaurant_id: str
    item_ids: list[str] = Field(..., min_length=1)


class Login(BaseModel):
    user_id: str


@app.exception_handler(db.DatabaseMissingError)
def database_missing(request: Request, exc: db.DatabaseMissingError):
    """A clear message instead of a 500 crash when setup_db.py hasn't been run."""
    return JSONResponse(status_code=503, content={"detail": str(exc)})


@app.exception_handler(db.NotFoundError)
def not_found(request: Request, exc: db.NotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exc)})


# ---------- People ----------

@app.get("/api/users")
def get_users():
    """The demo profiles shown on the login page."""
    return db.list_users()


@app.post("/api/login")
def login(body: Login):
    """Demo login: no passwords, it just confirms the profile exists."""
    return db.get_user(body.user_id)


@app.get("/api/users/{user_id}/orders")
def get_orders(user_id: str, restaurant: str | None = None):
    """A user's orders, newest first, e.g. /api/users/achieng/orders?restaurant=mama-wanjiku"""
    return db.list_orders(user_id, restaurant)


@app.get("/api/users/{user_id}/recent-items")
def get_recent_items(
    user_id: str,
    restaurant: str,
    hours: int = Query(default=24, ge=1, le=168, description="How far back to look (max 1 week)"),
):
    """Dishes this user ordered here recently, e.g. /api/users/achieng/recent-items?restaurant=mama-wanjiku

    The Recommendations page uses this to pre-fill "skip what you had recently".
    """
    return {"hours": hours, "item_ids": db.recent_item_ids(user_id, restaurant, hours)}


# ---------- Restaurants ----------

@app.get("/api/restaurants")
def get_restaurants():
    return db.list_restaurants()


@app.get("/api/restaurants/{restaurant_id}")
def get_restaurant(restaurant_id: str):
    """One restaurant's details and today's specials."""
    return db.get_restaurant(restaurant_id)


@app.get("/api/restaurants/{restaurant_id}/menu")
def get_menu(restaurant_id: str):
    """The restaurant's menu, grouped by slot."""
    return db.load_menu(restaurant_id)


@app.get("/api/restaurants/{restaurant_id}/recommend")
def get_recommendations(
    restaurant_id: str,
    budget: int = Query(..., ge=0, description="Budget in KES"),
    history: list[str] = Query(default=[], description="Ids of items eaten recently"),
    limit: int = Query(default=3, ge=1, le=10),
):
    """Top combos within budget, e.g. /api/restaurants/mama-wanjiku/recommend?budget=300&history=mw-pilau"""
    return recommend(budget, db.load_menu(restaurant_id), history=history, limit=limit)


@app.post("/api/orders", status_code=201)
def create_order(order: Order):
    """Records an order, e.g. {"user_id": "achieng", "restaurant_id": "mama-wanjiku", "item_ids": ["mw-pilau", "mw-chai"]}."""
    try:
        order_id, total = db.record_order(order.user_id, order.restaurant_id, order.item_ids)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"order_id": order_id, "total": total}
