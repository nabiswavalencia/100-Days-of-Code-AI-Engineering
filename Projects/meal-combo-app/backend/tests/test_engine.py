import numpy as np
import pytest

from engine import build_combos, recommend, score_items, z_scores
from seed_data import RESTAURANTS

# Mama Wanjiku's menu is the original app's menu (with prefixed ids),
# so the original engine expectations still hold.
KIBANDA = RESTAURANTS[0]["menu"]


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
    all_ids = {item["id"] for options in KIBANDA.values() for item in options}
    assert set(score_items(KIBANDA)) == all_ids


def test_pilau_scores_highest():
    # Highest rating (4.8) and second-most purchases: the worked example in the original THOUGHT_PROCESS.md
    scores = score_items(KIBANDA)
    assert max(scores, key=scores.get) == "mw-pilau"
    assert scores["mw-pilau"] == pytest.approx(1.277, abs=1e-3)


def test_more_purchases_raises_the_score():
    before = score_items(KIBANDA)["mw-githeri"]
    busier = {slot: [dict(item) for item in options] for slot, options in KIBANDA.items()}
    busier["main"][3]["purchases"] += 100  # githeri
    assert score_items(busier)["mw-githeri"] > before


# ---------- build_combos ----------

@pytest.mark.parametrize("restaurant", RESTAURANTS, ids=lambda r: r["id"])
def test_builds_60_combos_for_every_restaurant(restaurant):
    # 4x3x3 full meals + 4x3 main+side + 4x3 main+drink
    assert len(build_combos(restaurant["menu"])) == 36 + 12 + 12


def test_every_combo_has_a_main():
    main_ids = {item["id"] for item in KIBANDA["main"]}
    assert all(combo[0]["id"] in main_ids for combo in build_combos(KIBANDA))


# ---------- recommend ----------

@pytest.mark.parametrize("budget", [150, 200, 300, 1000])
def test_never_goes_over_budget(budget):
    for combo in recommend(budget, KIBANDA, limit=10):
        assert combo["total"] <= budget


def test_total_is_the_sum_of_prices():
    for combo in recommend(300, KIBANDA, limit=10):
        assert combo["total"] == sum(item["price"] for item in combo["items"])


def test_results_are_sorted_best_first():
    scores = [combo["score"] for combo in recommend(1000, KIBANDA, limit=10)]
    assert scores == sorted(scores, reverse=True)


def test_history_items_are_never_suggested():
    for combo in recommend(1000, KIBANDA, history=["mw-pilau", "mw-chai"], limit=10):
        assert "mw-pilau" not in item_ids(combo)
        assert "mw-chai" not in item_ids(combo)


def test_limit_controls_how_many_come_back():
    assert len(recommend(1000, KIBANDA, limit=5)) == 5


def test_too_small_a_budget_returns_nothing():
    # The cheapest possible combo is Githeri + Kachumbari = KES 120
    assert recommend(119, KIBANDA) == []
    assert recommend(120, KIBANDA) != []


def test_great_two_item_combo_beats_weaker_full_meal():
    # The Day 35 goal: on KES 150, Chapati & Beans + Chai beats Githeri + Kachumbari + Chai
    top = recommend(150, KIBANDA)
    assert item_ids(top[0]) == ["mw-chapati-beans", "mw-chai"]
    assert ["mw-githeri", "mw-kachumbari", "mw-chai"] in [item_ids(combo) for combo in top]


def test_avg_rating_is_rounded_mean():
    combo = recommend(300, KIBANDA)[0]
    expected = np.mean([item["rating"] for item in combo["items"]])
    assert combo["avg_rating"] == round(expected, 2)


@pytest.mark.parametrize("restaurant", RESTAURANTS, ids=lambda r: r["id"])
def test_default_budget_gives_three_picks_everywhere(restaurant):
    assert len(recommend(restaurant["default_budget"], restaurant["menu"])) == 3
