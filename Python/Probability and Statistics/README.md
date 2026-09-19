# Probability and Statistics (Days 25-28)

Runnable Python scripts for the Day 25-28 notes. Needs `numpy`, `scipy`, `pandas` and `matplotlib`.

## Day 25 - Probability vs. Statistics
- `probability-concepts.py` - sample space, events, simple probability, intersection (AND) and union (OR).
- `probability-vs-statistics.py` - probability predicts future events, statistics analyses past data; coin-flip counts converging to the theoretical 0.5.

## Day 26 - Spread and Distributions
- `spread-and-zscores.py` - range, IQR, sample variance / std dev (`ddof=1`), z-scores and the 68-95-99.7 rule.
- `binomial-and-normal.py` - discrete vs continuous, binomial PMF and normal PDF / CDF with `scipy.stats`.

## Day 27 - Distributions, Sampling and the CLT
- `binomial-and-poisson.py` - binomial (fixed trials) vs Poisson (event rate), PMF and CDF.
- `sampling-and-clt.py` - simulates the Central Limit Theorem on a skewed population, computes the standard error, and saves `clt-simulation.png`.

## Day 28 - Consolidation on a real dataset (Titanic)
Uses `Projects/titanic-project/data/titanic.csv` via the shared loader `titanic_data.py`. Plain-language interpretations of every result are in [findings.md](findings.md); plots are saved to `plots/`.
1. `descriptive-statistics.py` - describe, mean, median, mode, std, variance, IQR and outliers for Age and Fare, with an explanation printed next to each number.
2. `grouping-and-comparing.py` - `groupby` + `agg` across Pclass and Sex (the pandas version of SQL `GROUP BY`).
3. `visualising-distributions.py` - histograms, box plots, bar chart and scatter plot.
4. `probability-simulation.py` - coin-flip simulation and the law of large numbers.
5. `bayes-theorem.py` - prior, likelihood, evidence and posterior for a medical test.
6. `distribution-practice.py` - binomial and normal PMF / PDF / CDF questions.
7. `sampling-distributions.py` - sample variability, standard error, sampling bias and the CLT idea.
8. `correlation-and-covariance.py` - correlation, covariance and a confounding check.

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
| Bayes' theorem | P(H given E) = P(E given H) * P(H) / P(E) |
| Correlation | r = cov(X, Y) / (std(X) * std(Y)) |

## Takeaways
- Probability gives the theory, statistics gives the data that validates it.
- PMF is for discrete values, PDF is for continuous measurements.
- Bernoulli trials build the binomial; rate modelling uses the Poisson.
- CLT: sample means of large samples (n >= 30) are approximately normal, even for non-normal data.
- Bigger samples reduce the standard error, so the sample mean is a more precise estimate.
