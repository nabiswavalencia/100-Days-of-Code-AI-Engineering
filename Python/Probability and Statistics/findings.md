# Day 28 - What the numbers mean (Titanic dataset)

Figures come from running the scripts on `Projects/titanic-project/data/titanic.csv` (891 passengers). Re-run a script to reproduce them.

## 1. Descriptive statistics (`descriptive-statistics.py`)
- **Age** (714 of 891 recorded): mean 29.7, median 28.0, std 14.5, IQR 17.9. Mean and median are close, so ages are only slightly right-skewed. The middle half of passengers are aged 20 to 38, and the standard deviation of 14.5 shows ages vary moderately around the average.
- **Fare**: mean 32.20, median 14.45, mode 8.05, std 49.69. The mean is more than double the median, so fares are strongly right-skewed. A standard deviation larger than the mean means fares vary enormously. 116 of 891 fares are outliers by the 1.5*IQR rule, with a maximum of 512.33.
- Takeaway: for skewed data like Fare the **median** describes the typical passenger better than the mean, which a few very expensive tickets inflate.

## 2. Grouping and comparing (`grouping-and-comparing.py`)
| Pclass | count | mean fare | median fare | std |
| --- | --- | --- | --- | --- |
| 1 | 216 | 84.15 | 60.29 | 78.38 |
| 2 | 184 | 20.66 | 14.25 | 13.42 |
| 3 | 491 | 13.68 | 8.05 | 11.78 |

- Highest average: first class (84.15).
- Greatest variation: first class (std 78.38), so first-class fares are the least predictable.
- Mean vs median: the mean is above the median in every class, and the gap is biggest in first class (23.87), so first-class tickets are right-skewed.
- Outliers: yes. The 512.33 fares alone drag the first-class mean well above its median. Third class has the most outliers by count (52) because its middle 50% is so narrow.
- Age by class shows the same ordering as wealth: first class is oldest (mean 38.2), third youngest (mean 25.1).
- Survival rate by class and sex: women in first and second class survived at over 90%, third-class men at 13.5%.

## 3. Visualisations (`visualising-distributions.py`, saved in `plots/`)
- **Age histogram**: centre near 28, a spike of young children, a long thin tail to 80.
- **Fare histogram**: a tall spike under 50 and a long right tail, so centre is low and skew is strong.
- **Fare box plot by class**: first class has a much higher median, a much wider box (spread) and many upper outliers; second and third are compressed near the bottom.
- **Survival bar chart**: survival falls from first to third class.
- **Age vs Fare scatter**: a shapeless cloud, so there is almost no linear relationship.

## 4. Simulation and the law of large numbers (`probability-simulation.py`)
- 10 flips gave 0.80 heads; 10,000 flips gave 0.497; 100,000 gave 0.5008. The estimate does approach 0.5.
- Repeating each experiment 200 times, the spread of the estimates matched sqrt(p(1-p)/n): about 0.16 at n=10 and 0.005 at n=10,000.
- Why: individual flips stay random, but random errors cancel as n grows, so the average becomes stable.

## 5. Bayes' theorem (`bayes-theorem.py`)
- Prior 1% have the condition. Likelihood (sensitivity) 90%. Evidence: 5.85% of everyone tests positive (90% of 1% plus 5% of 99%). Posterior: only 15.4% of positives really have the condition.
- In 10,000 people: 90 true positives against 495 false positives. Healthy people vastly outnumber sick ones, so false positives dominate.
- The prior matters: the same test gives a posterior of 1.8% at a 0.1% prior and 94.7% at a 50% prior.
- Note: the illustrative `evidence = 0.05` in the task is not consistent with a 0.90 likelihood and 0.01 prior, so the script computes evidence with the law of total probability instead.

## 6. Distributions (`distribution-practice.py`)
- Binomial(10, 0.6): P(exactly 7) = 0.215, but P(at least 7) = 0.382. "At least" needs `1 - cdf(6)` (or `sf(6)`); `pmf` only gives one exact value.
- Normal(60, 10): P(score <= 70) = 0.841, and a 70 is z = 1.0. The top 10% start at about 72.8.
- **PMF** = probability of an exact discrete value; **PDF** = density (can exceed 1, only areas are probabilities); **CDF** = P(X <= x).
- A normal model for Titanic ages predicts 21.0% aged 18 or under; the real figure is 19.5%, so it fits reasonably.

## 7. Sampling (`sampling-distributions.py`)
- Five random samples of 30 from the same population gave five different means (47.7 to 52.2): a sample is a noisy view of the population.
- The standard error of the mean was 1.83, matching sigma / sqrt(n) = 1.83. It shrinks as n grows (4.5 at n=5, 0.45 at n=500).
- **Sampling bias**: a random sample of 200 fares averaged 32.19 (population 32.20), but a sample only of passengers with a known cabin averaged 77.27. More data cannot fix a biased way of choosing the sample.

## 8. Correlation and covariance (`correlation-and-covariance.py`)
- Age vs Fare: correlation 0.096, covariance 73.85. Scaling fares by 100 changes the covariance (to 0.74) but not the correlation, which is why correlation is easier to interpret.
- Pclass vs Fare is -0.55: higher-class numbers (lower class) mean lower fares.
- Fare vs Survived is 0.26 overall, but within each class it drops to 0.19, 0.10 and 0.00. Passenger class (and sex) is a **confounder**: fare mostly tells us which class someone travelled in. Correlation is not causation.
