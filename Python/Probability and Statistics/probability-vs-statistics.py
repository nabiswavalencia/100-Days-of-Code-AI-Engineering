# Day 25 - Probability vs. Statistics
# Probability: known conditions -> predict future events (theory)
# Statistics:  observed data    -> understand past events (evidence)

import random

random.seed(42)  # reproducible results

# --- Introduce a random variable ---------------------------------------
outcome = random.choice(["Heads", "Tails"])
print(f"Outcome: {outcome}")

# --- Record counts of outcomes (statistics: past events) ---------------
counts = {"Heads": 0, "Tails": 0}
for _ in range(10):
    outcome = random.choice(["Heads", "Tails"])
    counts[outcome] += 1
print(f"Statistical Data (Past events): {counts}")

# --- Probability of future heads (probability: theory) -----------------
prob_heads = 0.5  # theoretical condition
print(f"Probabilistic Goal: Probability(Heads) = {prob_heads}")

# --- Connecting the two -------------------------------------------------
# Statistics validates the probability model: as trials grow, the observed
# proportion of heads converges towards the theoretical 0.5.
for n in (10, 100, 1_000, 100_000):
    heads = sum(random.choice(["Heads", "Tails"]) == "Heads" for _ in range(n))
    print(f"n = {n:>7}: observed P(Heads) = {heads / n:.4f}  (theory: {prob_heads})")
