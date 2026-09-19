# Step 3 - Visualise distributions and outliers
# For each plot ask: centre? spread? skew? outliers? differences between groups?

import matplotlib.pyplot as plt

from titanic_data import load_titanic, save_plot

df = load_titanic()

# --- Histogram: distribution of one numeric variable --------------------
fig, ax = plt.subplots(figsize=(6, 4))
df["Age"].hist(bins=20, ax=ax, color="tab:blue", edgecolor="white")
ax.axvline(df["Age"].mean(), color="black", linestyle="--", label="Mean")
ax.axvline(df["Age"].median(), color="tab:red", linestyle=":", label="Median")
ax.set_title("Distribution of Passenger Ages")
ax.set_xlabel("Age (years)")
ax.set_ylabel("Number of passengers")
ax.legend()
ax.grid(False)
save_plot(fig, "age-histogram.png")

fig, ax = plt.subplots(figsize=(6, 4))
df["Fare"].hist(bins=30, ax=ax, color="tab:orange", edgecolor="white")
ax.axvline(df["Fare"].mean(), color="black", linestyle="--", label="Mean")
ax.axvline(df["Fare"].median(), color="tab:red", linestyle=":", label="Median")
ax.set_title("Distribution of Fares (right-skewed)")
ax.set_xlabel("Fare")
ax.set_ylabel("Number of passengers")
ax.legend()
ax.grid(False)
save_plot(fig, "fare-histogram.png")

# --- Box plot: compare a distribution across groups ---------------------
fig, ax = plt.subplots(figsize=(6, 4))
df.boxplot(column="Fare", by="Pclass", ax=ax)
ax.set_title("Fare Distribution by Passenger Class")
fig.suptitle("")
ax.set_xlabel("Passenger class")
ax.set_ylabel("Fare")
ax.grid(False)
save_plot(fig, "fare-boxplot-by-class.png")

fig, ax = plt.subplots(figsize=(6, 4))
df.boxplot(column="Age", by="Pclass", ax=ax)
ax.set_title("Age Distribution by Passenger Class")
fig.suptitle("")
ax.set_xlabel("Passenger class")
ax.set_ylabel("Age (years)")
ax.grid(False)
save_plot(fig, "age-boxplot-by-class.png")

# --- Bar chart: compare a summary statistic across categories -----------
survival_by_class = df.groupby("Pclass")["Survived"].mean()
fig, ax = plt.subplots(figsize=(6, 4))
survival_by_class.plot.bar(ax=ax, color="tab:green", rot=0)
ax.set_title("Survival Rate by Passenger Class")
ax.set_xlabel("Passenger class")
ax.set_ylabel("Share who survived")
ax.set_ylim(0, 1)
save_plot(fig, "survival-bar-by-class.png")

# --- Scatter plot: relationship between two numeric variables -----------
fig, ax = plt.subplots(figsize=(6, 4))
ax.scatter(df["Age"], df["Fare"], alpha=0.4, s=15)
ax.set_title("Age vs Fare")
ax.set_xlabel("Age (years)")
ax.set_ylabel("Fare")
save_plot(fig, "age-vs-fare-scatter.png")

print("Saved 6 plots to the plots/ folder.")
plt.show()
