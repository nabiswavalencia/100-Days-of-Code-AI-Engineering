from fastapi import FastAPI, Query

from engine import recommend
from menu import MENU

app = FastAPI()


@app.get("/api/menu")
def get_menu():
    """The full menu, grouped by slot."""
    return MENU


@app.get("/api/recommend")
def get_recommendations(
    budget: int = Query(..., ge=0, description="Budget in KES"),
    history: list[str] = Query(default=[], description="Ids of items eaten recently"),
    limit: int = Query(default=3, ge=1, le=10),
):
    """Top combos within budget, e.g. /api/recommend?budget=300&history=pilau&history=chai"""
    return recommend(budget, history=history, limit=limit)
