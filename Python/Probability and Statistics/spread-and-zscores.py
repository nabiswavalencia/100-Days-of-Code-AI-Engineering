# Day 26 - Variance, Standard Deviation & Z-Scores
# Measures of spread describe how dispersed the data is around the centre.

import numpy as np

# --- Initialize data values --------------------------------------------
data = np.array([10, 20, 30, 40, 50])
mean_data = np.mean(data)
# Calculation: mean_data = 30.0

# --- Range and IQR ------------------------------------------------------
data_range = np.ptp(data)  # max - min
q1 = np.percentile(data, 25)
q3 = np.percentile(data, 75)
iqr = q3 - q1
# Result: range = 40, iqr = 20.0

# --- Variance and standard deviation (sample) --------------------------
# ddof=1 divides by n-1 -> sample statistics
var_data = np.var(data, ddof=1)
std_data = np.std(data, ddof=1)
# Result: var = 250.0, std = 15.81

# --- Z-score for a specific value --------------------------------------
# z = (x - mean) / s  -> how many standard deviations x is from the mean
target_value = 40
z_score = (target_value - mean_data) / std_data
# Result: z_score = (40 - 30.0) / 15.81 = 0.632

# --- Print results -----------------------------------------------------
print(f"Mean: {mean_data}, Std Dev: {std_data:.2f}")
print(f"Range: {data_range}, IQR: {iqr}")
print(f"Variance: {var_data}")
print(f"Value: {target_value}, Z-Score: {z_score:.3f}")

# --- Empirical rule (68-95-99.7) ----------------------------------------
# In a normal distribution ~68% of data lies within 1 SD of the mean,
# ~95% within 2 SD and ~99.7% within 3 SD.
rng = np.random.default_rng(42)
normal_sample = rng.normal(loc=mean_data, scale=std_data, size=100_000)
for k in (1, 2, 3):
    share = np.mean(np.abs(normal_sample - mean_data) <= k * std_data)
    print(f"Within {k} SD of the mean: {share:.1%}")
