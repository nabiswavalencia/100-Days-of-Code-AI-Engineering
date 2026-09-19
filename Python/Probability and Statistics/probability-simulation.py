# Step 4 - Probability simulation and the law of large numbers

import random

import matplotlib.pyplot as plt
import numpy as np

from titanic_data import save_plot

random.seed(42)


def estimate_heads(trials):
    heads = 0
    for _ in range(trials):
        if random.choice(["heads", "tails"]) == "heads":
            heads += 1
    return heads / trials


# --- One estimate per trial count --------------------------------------
print("Trials  -> estimated P(heads)   (true value 0.5)")
for trials in (10, 100, 1_000, 10_000, 100_000):
    estimate = estimate_heads(trials)
    print(f"{trials:>7} -> {estimate:.4f}   error = {abs(estimate - 0.5):.4f}")

# --- How much does the estimate itself vary? ---------------------------
# Repeat each experiment 200 times. The spread of the estimates should shrink
# like sqrt(p * (1 - p) / n): the standard error of a proportion.
print("\nTrials  -> spread of 200 repeated estimates   theory sqrt(p(1-p)/n)")
for trials in (10, 100, 1_000, 10_000):
    estimates = [estimate_heads(trials) for _ in range(200)]
    theory = (0.5 * 0.5 / trials) ** 0.5
    print(f"{trials:>7} -> {np.std(estimates):.4f}                              {theory:.4f}")

# --- Running proportion converging to 0.5 ------------------------------
flips = np.random.default_rng(42).integers(0, 2, size=10_000)
running_proportion = np.cumsum(flips) / np.arange(1, len(flips) + 1)

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(running_proportion, color="tab:blue")
ax.axhline(0.5, color="black", linestyle="--", label="True probability 0.5")
ax.set_xscale("log")
ax.set_title("Law of Large Numbers: coin flips")
ax.set_xlabel("Number of flips (log scale)")
ax.set_ylabel("Proportion of heads so far")
ax.legend()
save_plot(fig, "law-of-large-numbers.png")

print(
    "\nWhy more trials help: each flip is random, but the random errors cancel out. "
    "The chance of drifting far from 0.5 shrinks as n grows (spread ~ 1/sqrt(n))."
)
plt.show()
