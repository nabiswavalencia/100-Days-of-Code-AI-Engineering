"""Recommendation engine for meal combos.

Steps:
1. Score every item by standardizing rating and popularity (z-scores).
2. Build every possible combo (Cartesian product), including 2-item combos.
3. Drop combos that go over budget or repeat something eaten recently.
4. Rank what's left by combo score.
"""
from itertools import product

import numpy as np

from menu import MENU

# Which slots a combo can be made of. Every combo includes a main.
COMBO_SHAPES = [
    ("main", "side", "drink"),
    ("main", "side"),
    ("main", "drink"),
]

# How much each metric counts towards an item's score.
RATING_WEIGHT = 0.6
POPULARITY_WEIGHT = 0.4


def z_scores(values):
    """Standardize values: how many standard deviations each is from the mean."""
    values = np.asarray(values, dtype=float)
    std = values.std()
    if std == 0:
        return np.zeros_like(values)
    return (values - values.mean()) / std


def score_items(menu):
    """Returns {item_id: score}.

    Ratings sit on a 1-5 scale and purchases on a 0-200+ scale, so they can't be
    added directly. Z-scores put both on the same scale first.
    """
    items = [item for options in menu.values() for item in options]
    rating_z = z_scores([item["rating"] for item in items])
    popularity_z = z_scores([item["purchases"] for item in items])
    scores = RATING_WEIGHT * rating_z + POPULARITY_WEIGHT * popularity_z
    return {item["id"]: float(score) for item, score in zip(items, scores)}


def build_combos(menu):
    """Every combo for every shape: one item from each slot in the shape."""
    combos = []
    for shape in COMBO_SHAPES:
        for items in product(*(menu[slot] for slot in shape)):
            combos.append(list(items))
    return combos


def recommend(budget, history=(), menu=MENU, limit=3):
    """Top combos within budget that avoid anything in `history` (item ids)."""
    item_scores = score_items(menu)
    results = []

    for items in build_combos(menu):
        if any(item["id"] in history for item in items):
            continue

        total = sum(item["price"] for item in items)
        if total > budget:
            continue

        results.append({
            "items": items,
            "total": total,
            "avg_rating": round(float(np.mean([item["rating"] for item in items])), 2),
            # Average, not sum, so a great 2-item combo can beat a weak 3-item one.
            "score": round(float(np.mean([item_scores[item["id"]] for item in items])), 3),
        })

    results.sort(key=lambda combo: combo["score"], reverse=True)
    return results[:limit]


if __name__ == "__main__":
    def show(title, combos):
        print(f"\n{title}")
        if not combos:
            print("  No combo fits.")
        for combo in combos:
            names = " + ".join(item["name"] for item in combo["items"])
            print(f"  {names:<45} KES {combo['total']:>3}  rating {combo['avg_rating']}  score {combo['score']:+.3f}")

    print("Item scores:")
    for item_id, score in sorted(score_items(MENU).items(), key=lambda pair: -pair[1]):
        print(f"  {item_id:<14} {score:+.3f}")

    show("Budget KES 300", recommend(300))
    show("Budget KES 150", recommend(150))
    show("Budget KES 300, ate Pilau yesterday", recommend(300, history=["pilau"]))
    show("Budget KES 100", recommend(100))
