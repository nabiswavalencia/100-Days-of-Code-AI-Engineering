# Step 6 - Answering practical questions with binomial and normal distributions
#   PMF: probability of an exact discrete value       P(X = k)
#   PDF: density of a continuous distribution (height of the curve, NOT a probability)
#   CDF: probability of being less than or equal to a value   P(X <= x)

from scipy.stats import binom, norm

from titanic_data import load_titanic

# --- Binomial: n = 10 attempts, success probability p = 0.6 ------------
n, p = 10, 0.6

print("Binomial(n=10, p=0.6)")
print(f"P(X = 7)         = {binom.pmf(k=7, n=n, p=p):.4f}")  # exactly seven
print(f"P(X <= 7)        = {binom.cdf(k=7, n=n, p=p):.4f}")
print(f"P(X >= 7)        = {1 - binom.cdf(k=6, n=n, p=p):.4f}   (at least seven = 1 - P(X <= 6))")
print(f"P(X >= 7) (sf)   = {binom.sf(k=6, n=n, p=p):.4f}   (same thing, sf = survival function)")
print(f"P(4 <= X <= 6)   = {binom.cdf(6, n, p) - binom.cdf(3, n, p):.4f}")
print(f"Expected successes: {binom.mean(n, p):.1f}, std: {binom.std(n, p):.2f}")

# --- Normal: scores with mean 60 and standard deviation 10 -------------
mu, sigma = 60, 10

print("\nNormal(mean=60, std=10)")
print(f"P(score <= 70)        = {norm.cdf(70, loc=mu, scale=sigma):.4f}")
print(f"P(score > 70)         = {1 - norm.cdf(70, loc=mu, scale=sigma):.4f}")
print(f"P(50 <= score <= 70)  = {norm.cdf(70, mu, sigma) - norm.cdf(50, mu, sigma):.4f}   (about 68%, within 1 SD)")
print(f"Score needed for the top 10% = {norm.ppf(0.90, loc=mu, scale=sigma):.1f}   (ppf is the inverse of the CDF)")
print(f"z-score of 70 = {(70 - mu) / sigma:.1f}")

# --- PDF is a density, not a probability -------------------------------
print("\nPDF vs probability")
print(f"norm.pdf(60, scale=10)  = {norm.pdf(60, loc=60, scale=10):.4f}")
print(f"norm.pdf(0, scale=0.1)  = {norm.pdf(0, loc=0, scale=0.1):.4f}   (above 1 - fine, it is a density)")
print("For a continuous variable P(X = x) is 0; only ranges have probability (area under the PDF).")

# --- Does a normal model fit real data? --------------------------------
ages = load_titanic()["Age"].dropna()
age_mean, age_std = ages.mean(), ages.std()
print("\nTitanic ages vs a normal model")
print(f"Age mean = {age_mean:.1f}, std = {age_std:.1f}")
print(f"Model:    P(age <= 18) = {norm.cdf(18, loc=age_mean, scale=age_std):.3f}")
print(f"Observed: P(age <= 18) = {(ages <= 18).mean():.3f}")
