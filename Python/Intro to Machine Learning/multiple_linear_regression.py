
from pathlib import Path

import pandas as pd
from sklearn.linear_model import LinearRegression


# ---------------------------------------------------------------------------
# 1. MULTIPLE LINEAR REGRESSION (Concept & Equation)
# ---------------------------------------------------------------------------
#
# Definition:
# Multiple linear regression models the linear relationship between one
# continuous outcome (y) and multiple explanatory features (x_1, ..., x_k).
#
# Equation:
# y = beta_0 + beta_1*x_1 + beta_2*x_2 + ... + beta_k*x_k + epsilon
#
# Partial slopes (beta_j): the estimated change in y for a one-unit increase
# in x_j, holding all other predictors constant (ceteris paribus).
#
# Geometric view:
# The model fits a multidimensional flat hyperplane rather than a 2D line.


# ---------------------------------------------------------------------------
# 2. THE R^2 TRAP & ADJUSTED R^2
# ---------------------------------------------------------------------------
#
# Standard R^2 never decreases when new features are added, even when those
# features are pure, uncorrelated noise.
#
# Adjusted R^2 formula:
# R^2_adj = 1 - [((1 - R^2) * (n - 1)) / (n - p - 1)]
#
# n = sample size (total rows)
# p = number of independent features (excluding the intercept)
#
# Adjusted R^2 penalizes model complexity. It rises only when a new variable
# improves the model enough to justify its additional complexity.


# ---------------------------------------------------------------------------
# 3. INTERPRETING MULTIPLE REGRESSION
# ---------------------------------------------------------------------------
#
# Feature significance:
# Check individual p-values (often p < 0.05) to assess whether a feature adds
# meaningful signal. sklearn's LinearRegression does not calculate p-values;
# statsmodels is a suitable tool when formal statistical inference is needed.
#
# Multicollinearity check:
# Predictors should not be heavily correlated with each other. A common rule
# of thumb is to keep each feature's variance inflation factor (VIF) below 5.
#
# Feature scaling:
# If features have wildly different magnitudes, such as Age and Annual Income,
# standardize them with StandardScaler so coefficient sizes are comparable.


def adjusted_r_squared(r_squared: float, sample_size: int, feature_count: int) -> float:
    """Calculate adjusted R-squared from R-squared, n, and p."""
    denominator = sample_size - feature_count - 1
    if denominator <= 0:
        raise ValueError("There must be more rows than features plus one.")
    return 1 - (1 - r_squared) * (sample_size - 1) / denominator


def main() -> None:
    # Load the SAT/GPA data used in the earlier simple-regression lesson.
    data_path = Path(__file__).parent / "sat_gpa.csv"
    df = pd.read_csv(data_path)

    # These two columns are deterministic teaching examples. Rand_123 is
    # intentionally unrelated noise, making the R^2 trap visible.
    random_pattern = [17, 42, 8, 91, 36, 64, 13, 77, 25, 55]
    attendance_pattern = [72, 78, 81, 84, 88, 91, 93, 95, 97, 99]
    df["Rand_123"] = [random_pattern[index % len(random_pattern)] for index in range(len(df))]
    df["Attendance"] = [attendance_pattern[index % len(attendance_pattern)] for index in range(len(df))]

    # -----------------------------------------------------------------------
    # 4. IMPLEMENTATION IN PYTHON (SCIKIT-LEARN)
    # -----------------------------------------------------------------------
    # Feature matrix X (2D) and target vector y (1D).
    X = df[["SAT", "Rand_123", "Attendance"]]
    y = df["GPA"]

    # Fit the multiple regression model.
    reg = LinearRegression()
    reg.fit(X, y)

    # Extract parameters.
    intercept = reg.intercept_
    coefficients = reg.coef_

    # -----------------------------------------------------------------------
    # 5. CALCULATING ADJUSTED R^2 & OUTPUT
    # -----------------------------------------------------------------------
    # Compute standard R-squared.
    r2 = reg.score(X, y)

    # Sample size (n) and feature count (p).
    n = X.shape[0]
    p = X.shape[1]

    # Adjusted R-squared calculation.
    adj_r2 = adjusted_r_squared(r2, n, p)

    print("Day 34 - Multiple Linear Regression")
    print(f"Intercept: {intercept:.4f}")
    print(f"Coefficients: {coefficients}")
    print(f"R-squared: {r2:.4f}")
    print(f"Adjusted R-squared: {adj_r2:.4f}")

    # For honest model evaluation, split data before fitting any preprocessing
    # and evaluate R^2 on held-out data rather than training data alone.


if __name__ == "__main__":
    main()


# ---------------------------------------------------------------------------
# TAKEAWAYS
# ---------------------------------------------------------------------------
# - Multiple regression models the isolated effect of each feature while
#   holding all other features fixed.
# - Standard R^2 inflates with every extra feature; adjusted R^2 penalizes
#   useless complexity.
# - High correlation among predictors can destabilize coefficients, so screen
#   features for multicollinearity before fitting.