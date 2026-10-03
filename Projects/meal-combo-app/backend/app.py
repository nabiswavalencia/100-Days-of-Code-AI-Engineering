from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

from db import load_menu, record_order
from engine import recommend

app = FastAPI()


class Order(BaseModel):
    item_ids: list[str] = Field(..., min_length=1)


@app.get("/api/menu")
def get_menu():
    """The full menu, grouped by slot."""
    return load_menu() 


@app.get("/api/recommend")
def get_recommendations(
    budget: int = Query(..., ge=0, description="Budget in KES"),
    history: list[str] = Query(default=[], description="Ids of items eaten recently"),
    limit: int = Query(default=3, ge=1, le=10),
):
    """Top combos within budget, e.g. /api/recommend?budget=300&history=pilau&history=chai"""
    return recommend(budget, history=history, menu=load_menu(), limit=limit)


@app.post("/api/orders", status_code=201)
def create_order(order: Order):
    """Records an order, e.g. {"item_ids": ["pilau", "chai"]}."""
    try:
        order_id = record_order(order.item_ids)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"order_id": order_id}
