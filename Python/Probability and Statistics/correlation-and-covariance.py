# Step 8 - Correlation and covariance
#   Covariance:  do two variables move together? (sign only is easy to read; size depends on units)
#   Correlation: strength and direction of a LINEAR relationship, always between -1 and 1
#   Correlation does not prove causation; confounders can create or hide relationships.

import matplotlib.pyplot as plt

from titanic_data import load_titanic, save_plot

df = load_titanic()

# --- Two variables ------------------------------------------------------
correlation = df["Age"].corr(df["Fare"])
covariance = df["Age"].cov(df["Fare"])
print(f"Age vs Fare  -> correlation: {correlation:.3f}, covariance: {covariance:.2f}")

# --- Covariance depends on units, correlation does not -----------------
fare_in_hundreds = df["Fare"] / 100
print(f"Fare / 100   -> correlation: {df['Age'].corr(fare_in_hundreds):.3f}, covariance: {df['Age'].cov(fare_in_hundreds):.4f}")

# --- Correlation matrix ------------------------------------------------
cols = ["Survived", "Pclass", "Age", "SibSp", "Parch", "Fare"]
print("\nPearson correlation matrix")
print(df[cols].corr().round(2))

# Fare is heavily skewed, so a rank-based correlation is a useful cross-check
print(f"\nFare vs Survived: Pearson = {df['Fare'].corr(df['Survived']):.3f}, "
      f"Spearman = {df['Fare'].corr(df['Survived'], method='spearman'):.3f}")

# --- Confounding: Fare vs Survived --------------------------------------
# Higher fares go with higher survival, but fare mostly reflects class (and sex).
# Holding class fixed, the relationship weakens a lot.
print("\nConfounding check: Fare vs Survived within each passenger class")
for pclass, group in df.groupby("Pclass"):
    print(f"  Pclass {pclass}: correlation = {group['Fare'].corr(group['Survived']):.3f} (n = {len(group)})")

print("\nSurvival rate by sex (another confounder to watch):")
print(df.groupby("Sex")["Survived"].mean().round(3).to_string())

# --- Plot ---------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4))
ax1.scatter(df["Age"], df["Fare"], alpha=0.4, s=15)
ax1.set_title(f"Age vs Fare (r = {correlation:.2f})")
ax1.set_xlabel("Age (years)")
ax1.set_ylabel("Fare")

ax2.scatter(df["Pclass"] + (0.1 * (df.index % 5 - 2) / 2), df["Fare"], alpha=0.4, s=15, color="tab:orange")
ax2.set_title(f"Pclass vs Fare (r = {df['Pclass'].corr(df['Fare']):.2f})")
ax2.set_xlabel("Passenger class (jittered)")
ax2.set_ylabel("Fare")
ax2.set_xticks([1, 2, 3])
fig.tight_layout()
save_plot(fig, "correlation-scatter.png")
plt.show()
