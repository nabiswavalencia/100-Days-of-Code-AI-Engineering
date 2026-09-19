# Day 26 - Probability Distributions
# Discrete (counts, PMF) vs Continuous (measurements, PDF)

import numpy as np
from scipy.stats import binom, norm

# --- Binomial: n identical success/failure trials ----------------------
# P(k) = C(n, k) * p^k * (1 - p)^(n - k)
n = 10
p = 0.7
prob_k_success = binom.pmf(k=7, n=n, p=p)
# PMF gives P(exactly 7 successes)
print(f"P(7 successes in {n} trials, p={p}) = {prob_k_success:.4f}")

# Simulate 100 runs of n trials and compare with the theoretical PMF
rng = np.random.default_rng(42)
simulated = rng.binomial(n=n, p=p, size=100)
print(f"Simulated share with exactly 7 successes: {np.mean(simulated == 7):.2f}")

# --- Normal (Gaussian): symmetric bell curve ---------------------------
# Defined by mean (mu = peak) and standard deviation (sigma = spread)
mean_mu = 0
std_sigma = 1

pdf_val = norm.pdf(x=1.5, loc=mean_mu, scale=std_sigma)
# PDF value at x (height of the curve, not a probability)
cdf_val = norm.cdf(x=2.0, loc=mean_mu, scale=std_sigma)
# CDF value: P(X <= 2.0)

print(f"Normal PDF at x=1.5: {pdf_val:.4f}")
print(f"Normal CDF at x=2.0: {cdf_val:.4f}")
