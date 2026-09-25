# Day 31 - Hypothesis testing (t-tests) and VIF / multicollinearity
#   H0: "no difference" (mu1 = mu2)     H1: there is a difference (mu1 != mu2)
#   Decision rule: p < 0.05 -> reject H0;  p >= 0.05 -> fail to reject H0
#   Independent t-test (ttest_ind): two separate groups (e.g. test vs control)
#   Paired t-test (ttest_rel):      same subjects measured twice (e.g. before vs after)
#   VIF: how much a feature's coefficient variance is inflated by correlation with the
#        other features. ~1 = fine, > 5 = worth watching, > 10 = serious, inf = perfect collinearity

import warnings



import numpy as np
import pandas as pd
from scipy.stats import ttest_ind, ttest_rel
from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.tools.tools import add_constant

from titanic_data import load_titanic

ALPHA = 0.05


def decide(p_value):
    return "reject H0" if p_value < ALPHA else "fail to reject H0"


# --- 1. Toy t-tests (from the notes) ------------------------------------
group_a = [10, 12, 14, 16]
group_b = [11, 13, 15, 17]
before = [8, 9, 10, 11]
after = [12, 13, 14, 15]

result = ttest_ind(group_a, group_b)
print("Independent t-test (group_a vs group_b)")
print(f"  t = {result.statistic:.3f}, p = {result.pvalue:.4f} -> {decide(result.pvalue)}")

with warnings.catch_warnings():
    warnings.simplefilter("ignore")  # differences are all identical, scipy warns about zero spread
    result = ttest_rel(before, after)
print("Paired t-test (before vs after)")
print(f"  t = {result.statistic}, p = {result.pvalue} -> {decide(result.pvalue)}")
# Every subject improved by exactly 4, so the differences have zero spread:
# t is -inf and p is 0 - the most extreme "significant" result possible.

# Same numbers, but pretend they are two unrelated groups instead of the same people
result = ttest_ind(before, after)
print("Same data treated as independent groups")
print(f"  t = {result.statistic:.3f}, p = {result.pvalue:.4f} -> {decide(result.pvalue)}")
print("  Pairing removes the person-to-person variation, which is why the paired test is far stronger.\n")

# --- 2. Real data: did the survivors pay different fares? ---------------
df = load_titanic()
survived_fares = df.loc[df["Survived"] == 1, "Fare"]
died_fares = df.loc[df["Survived"] == 0, "Fare"]

print("Titanic: Fare of survivors vs non-survivors")
print(f"  mean fare survived = {survived_fares.mean():.2f}, died = {died_fares.mean():.2f}")
# Welch's t-test (equal_var=False) does not assume the two groups have the same variance
result = ttest_ind(survived_fares, died_fares, equal_var=False)
print(f"  Welch t = {result.statistic:.3f}, p = {result.pvalue:.2e} -> {decide(result.pvalue)}")

ages = df.dropna(subset=["Age"])
male_ages = ages.loc[ages["Sex"] == "male", "Age"]
female_ages = ages.loc[ages["Sex"] == "female", "Age"]
print("Titanic: Age of men vs women")
print(f"  mean age male = {male_ages.mean():.2f}, female = {female_ages.mean():.2f}")
result = ttest_ind(male_ages, female_ages, equal_var=False)
print(f"  Welch t = {result.statistic:.3f}, p = {result.pvalue:.4f} -> {decide(result.pvalue)}\n")

# --- 3. Correlation + VIF on the toy DataFrame from the notes -----------
toy = pd.DataFrame({"X1": [1, 2, 3], "X2": [2, 4, 6], "X3": [1, 0, 1]})
print("Toy correlation matrix")
print(toy.corr().round(2))
print(f"np.corrcoef(X1, X2):\n{np.corrcoef(toy['X1'], toy['X2'])}")

# X2 is exactly 2 * X1, so each can be predicted perfectly from the other -> VIF = inf
# (floating-point rounding shows it as a huge number like 1e15 instead).
# add_constant adds an intercept column; without it VIF values are misleading.
toy_x = add_constant(toy)
with warnings.catch_warnings():
    warnings.simplefilter("ignore")  # statsmodels warns the matrix is singular - that's the point
    toy_vif = pd.DataFrame({
        "feature": toy.columns,
        "VIF": [variance_inflation_factor(toy_x.values, i) for i in range(1, toy_x.shape[1])],
    })
print("\nToy VIF (X2 = 2 * X1 -> perfect collinearity)")
print(toy_vif.to_string(index=False))

# --- 4. VIF on real Titanic features ------------------------------------
features = df[["Pclass", "Age", "SibSp", "Parch", "Fare"]].dropna()
X = add_constant(features)
titanic_vif = pd.DataFrame({
    "feature": features.columns,
    "VIF": [variance_inflation_factor(X.values, i) for i in range(1, X.shape[1])],
})
print("\nTitanic feature VIF")
print(titanic_vif.round(2).to_string(index=False))
print("\nAll well under 5: Pclass and Fare are correlated, but not enough to break a regression model.")
