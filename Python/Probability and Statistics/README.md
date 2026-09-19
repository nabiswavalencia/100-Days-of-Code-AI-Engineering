# Probability and Statistics (Days 25-27)

Runnable Python scripts for the Day 25-27 notes. Needs `numpy`, `scipy` and `matplotlib`.

## Day 25 - Probability vs. Statistics
- `probability-concepts.py` - sample space, events, simple probability, intersection (AND) and union (OR).
- `probability-vs-statistics.py` - probability predicts future events, statistics analyses past data; coin-flip counts converging to the theoretical 0.5.

## Day 26 - Spread and Distributions
- `spread-and-zscores.py` - range, IQR, sample variance / std dev (`ddof=1`), z-scores and the 68-95-99.7 rule.
- `binomial-and-normal.py` - discrete vs continuous, binomial PMF and normal PDF / CDF with `scipy.stats`.

## Day 27 - Distributions, Sampling and the CLT
- `binomial-and-poisson.py` - binomial (fixed trials) vs Poisson (event rate), PMF and CDF.
- `sampling-and-clt.py` - simulates the Central Limit Theorem on a skewed population, computes the standard error, and saves `clt-simulation.png`.

## Key formulas
| Idea | Formula |
| --- | --- |
| Simple probability | P(A) = favourable outcomes / total outcomes |
| Intersection (independent) | P(A and B) = P(A) * P(B) |
| Union | P(A or B) = P(A) + P(B) - P(A and B) |
| Sample variance | s^2 = sum((x - mean)^2) / (n - 1) |
| Z-score | z = (x - mean) / s |
| Binomial | P(X=k) = C(n,k) * p^k * (1-p)^(n-k) |
| Poisson | P(X=k) = lambda^k * e^-lambda / k! |
| Standard error | SE = s / sqrt(n) |

## Takeaways
- Probability gives the theory, statistics gives the data that validates it.
- PMF is for discrete values, PDF is for continuous measurements.
- Bernoulli trials build the binomial; rate modelling uses the Poisson.
- CLT: sample means of large samples (n >= 30) are approximately normal, even for non-normal data.
- Bigger samples reduce the standard error, so the sample mean is a more precise estimate.
