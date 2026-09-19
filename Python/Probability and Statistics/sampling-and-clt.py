# Day 27 - Statistics: Sampling & the Central Limit Theorem (CLT)
# As the sample size n grows (n >= 30), the sampling distribution of the
# sample mean approaches a normal distribution, whatever the population shape.

import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(42)

# --- Population: strongly skewed exponential ---------------------------
pop = rng.exponential(scale=2, size=10_000)

# --- Simulate the CLT: 1000 sample means, each from a sample of 30 -----
n = 30
sample_means = [np.mean(rng.choice(pop, n)) for _ in range(1000)]

# --- Population characteristics ----------------------------------------
pop_mean = np.mean(pop)
pop_std = np.std(pop)
# Result: pop_mean ~ 2.0, pop_std ~ 2.0

# --- Standard error (SE) -----------------------------------------------
# Theory: SE = sigma / sqrt(n)  (smaller SE = more precise estimate of the mean)
theoretical_se = pop_std / np.sqrt(n)
# Simulation: the SE is the spread of the sample means themselves
simulated_se = np.std(sample_means, ddof=1)
# Result: both ~ 0.36

print(f"Population Mean: {pop_mean:.3f}, Population Std: {pop_std:.3f}")
print(f"Sampling Mean: {np.mean(sample_means):.3f}")
print(f"Theoretical SE (sigma / sqrt(n)): {theoretical_se:.3f}")
print(f"Simulated SE (std of sample means): {simulated_se:.3f}")

# --- Plot: skewed population vs. bell-shaped sampling distribution -----
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4))
ax1.hist(pop, bins=50, color="tab:orange", edgecolor="white")
ax1.set_title("Population (skewed exponential)")
ax2.hist(sample_means, bins=30, color="tab:blue", edgecolor="white")
ax2.axvline(pop_mean, color="black", linestyle="--", label="Population mean")
ax2.set_title(f"Sample means (n={n}) - approximately normal")
ax2.legend()
fig.tight_layout()
fig.savefig("clt-simulation.png", dpi=120)
plt.show()
