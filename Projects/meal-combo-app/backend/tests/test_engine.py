import numpy as np
import pytest

from engine import build_combos, recommend, score_items, z_scores
from menu import MENU


def item_ids(combo):
    return [item["id"] for item in combo["items"]]


# ---------- z_scores ----------

def test_z_scores_have_mean_0_and_std_1():
    z = z_scores([4.6, 4.8, 4.2, 3.9])
    assert z.mean() == pytest.approx(0)
    assert z.std() == pytest.approx(1)


def test_z_scores_match_the_formula():
    # mean = 20, std = 10, so 30 is one std above the mean
    assert z_scores([10, 20, 30]) == pytest.approx([-1.2247, 0, 1.2247], abs=1e-4)


def test_z_scores_of_identical_values_are_zero_not_nan():
    # std is 0 here, and dividing by 0 would give NaN
    assert list(z_scores([5, 5, 5])) == [0, 0, 0]


# ---------- score_items ----------

def test_every_item_gets_a_score():
    all_ids = {item["id"] for options in MENU.values() for item in options}
    assert set(score_items(MENU)) == all_ids


def test_pilau_scores_highest():
    # Highest rating (4.8) and second-most purchases: the worked example in THOUGHT_PROCESS.md
    scores = score_items(MENU)
    assert max(scores, key=scores.get) == "pilau"
    assert scores["pilau"] == pytest.approx(1.277, abs=1e-3)


def test_more_purchases_raises_the_score():
    before = score_items(MENU)["githeri"]
    busier = {slot: [dict(item) for item in options] for slot, options in MENU.items()}
    busier["main"][3]["purchases"] += 100  # githeri
    assert score_items(busier)["githeri"] > before


# ---------- build_combos ----------

def test_builds_60_combos():
    # 4x3x3 full meals + 4x3 main+side + 4x3 main+drink
    assert len(build_combos(MENU)) == 36 + 12 + 12


def test_every_combo_has_a_main():
    main_ids = {item["id"] for item in MENU["main"]}
    assert all(combo[0]["id"] in main_ids for combo in build_combos(MENU))


# ---------- recommend ----------

@pytest.mark.parametrize("budget", [150, 200, 300, 1000])
def test_never_goes_over_budget(budget):
    for combo in recommend(budget, limit=10):
        assert combo["total"] <= budget


def test_total_is_the_sum_of_prices():
    for combo in recommend(300, limit=10):
        assert combo["total"] == sum(item["price"] for item in combo["items"])


def test_results_are_sorted_best_first():
    scores = [combo["score"] for combo in recommend(1000, limit=10)]
    assert scores == sorted(scores, reverse=True)


def test_history_items_are_never_suggested():
    for combo in recommend(1000, history=["pilau", "chai"], limit=10):
        assert "pilau" not in item_ids(combo)
        assert "chai" not in item_ids(combo)


def test_limit_controls_how_many_come_back():
    assert len(recommend(1000, limit=5)) == 5


def test_too_small_a_budget_returns_nothing():
    # The cheapest possible combo is Githeri + Kachumbari = KES 120
    assert recommend(119) == []
    assert recommend(120) != []


def test_great_two_item_combo_beats_weaker_full_meal():
    # The Day 35 goal: on KES 150, Chapati & Beans + Chai beats Githeri + Kachumbari + Chai
    top = recommend(150)
    assert item_ids(top[0]) == ["chapati-beans", "chai"]
    assert ["githeri", "kachumbari", "chai"] in [item_ids(combo) for combo in top]


def test_avg_rating_is_rounded_mean():
    combo = recommend(300)[0]
    expected = np.mean([item["rating"] for item in combo["items"]])
    assert combo["avg_rating"] == round(expected, 2)
