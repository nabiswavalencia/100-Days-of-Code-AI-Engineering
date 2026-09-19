# Step 7 - Sampling, sampling bias, the sampling distribution and the CLT idea
#   Population / parameter: the whole group and a number describing it (mu, sigma)
#   Sample / statistic:     the subset we observe and a number computed from it (x-bar, s)

import matplotlib.pyplot as plt
import numpy as np

from titanic_data import load_titanic, save_plot

rng = np.random.default_rng(42)

# --- A sample varies from one draw to the next -------------------------
population = rng.normal(loc=50, scale=10, size=100_000)
print(f"Population parameters: mean = {population.mean():.2f}, std = {population.std():.2f}")

print("\nFive different random samples of 30 give five different means:")
for i in range(5):
    sample = rng.choice(population, size=30)
    print(f"  sample {i + 1}: mean = {sample.mean():.2f}")

# --- The sampling distribution of the mean -----------------------------
n = 30
sample_means = [rng.choice(population, size=n).mean() for _ in range(1000)]

print(f"\nAverage of 1000 sample means: {np.mean(sample_means):.2f}  (close to the population mean)")
print(f"Standard error (std of sample means): {np.std(sample_means, ddof=1):.3f}")
print(f"Theoretical SE = sigma / sqrt(n) = {population.std() / np.sqrt(n):.3f}")

# --- Bigger samples -> smaller standard error --------------------------
print("\nSample size -> standard error")
for size in (5, 30, 100, 500):
    means = [rng.choice(population, size=size).mean() for _ in range(1000)]
    print(f"  n = {size:>3}: SE = {np.std(means, ddof=1):.3f}  (theory {population.std() / np.sqrt(size):.3f})")

# --- Sampling bias: the sample does not represent the population -------
# Treat all Titanic passengers as the population. Cabin numbers were mostly
# recorded for wealthier passengers, so "passengers with a known cabin"
# is a biased sample of fares.
titanic = load_titanic()
fares = titanic["Fare"]
random_sample = fares.sample(n=200, random_state=42)
biased_sample = titanic.loc[titanic["Cabin"].notna(), "Fare"].sample(n=200, random_state=42)

print("\nSampling bias (Titanic fares)")
print(f"  Population mean fare:              {fares.mean():.2f}")
print(f"  Random sample of 200, mean fare:   {random_sample.mean():.2f}")
print(f"  Known-cabin sample of 200, mean:   {biased_sample.mean():.2f}   <- systematically too high")
print("  A bigger biased sample does not fix bias; it only makes the wrong answer more precise.")

# --- Plot: skewed population, bell-shaped sampling distribution --------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4))
ax1.hist(fares, bins=40, color="tab:orange", edgecolor="white")
ax1.set_title("Titanic fares: a skewed population")
ax1.set_xlabel("Fare")
ax1.set_ylabel("Number of passengers")

fare_means = [fares.sample(n=30, random_state=int(s)).mean() for s in rng.integers(0, 1_000_000, size=1000)]
ax2.hist(fare_means, bins=30, color="tab:blue", edgecolor="white")
ax2.axvline(fares.mean(), color="black", linestyle="--", label="Population mean")
ax2.set_title("Means of 1000 samples of n=30: near normal (CLT)")
ax2.set_xlabel("Sample mean fare")
ax2.set_ylabel("Number of samples")
ax2.legend()
fig.tight_layout()
save_plot(fig, "sampling-distribution-of-fare.png")
plt.show()
