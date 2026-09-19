# Day 27 - Probability: Distributions
# PMF is for discrete values, PDF is for continuous measurements.
# Bernoulli trials -> Binomial. Event rates -> Poisson.

from scipy.stats import binom, poisson

# --- Binomial: n independent Bernoulli trials, success probability p ----
# P(X = k) = C(n, k) * p^k * (1 - p)^(n - k)
n = 10
p = 0.5

binom_pmf = binom.pmf(k=5, n=n, p=p)  # P(X = 5)
binom_cdf = binom.cdf(k=5, n=n, p=p)  # P(X <= 5)
print(f"Binomial(n={n}, p={p}): P(X=5) = {binom_pmf:.4f}, P(X<=5) = {binom_cdf:.4f}")

# --- Poisson: count of events in a fixed time/space interval -----------
# P(X = k) = (lambda^k * e^-lambda) / k!
mu = 3  # mean rate (lambda)

poisson_pmf = poisson.pmf(k=4, mu=mu)  # P(X = 4)
poisson_cdf = poisson.cdf(k=4, mu=mu)  # P(X <= 4)
print(f"Poisson(mu={mu}): P(X=4) = {poisson_pmf:.4f}, P(X<=4) = {poisson_cdf:.4f}")

# The CDF is the running total of the PMF
assert abs(binom_cdf - sum(binom.pmf(k, n, p) for k in range(6))) < 1e-12
assert abs(poisson_cdf - sum(poisson.pmf(k, mu) for k in range(5))) < 1e-12
