# Step 2 - Grouping and comparing data with pandas
# Same idea as SQL:
#   SELECT Pclass, COUNT(Fare), AVG(Fare), ... FROM titanic GROUP BY Pclass

from titanic_data import load_titanic

df = load_titanic()


def compare_groups(df, group_col, value_col):
    group_summary = df.groupby(group_col)[value_col].agg(["count", "mean", "median", "std"])
    print(f"===== {value_col} by {group_col} =====")
    print(group_summary.round(2))

    # Outliers per group using the 1.5 * IQR rule computed within each group
    def count_outliers(s):
        q1, q3 = s.quantile(0.25), s.quantile(0.75)
        iqr = q3 - q1
        return int(((s < q1 - 1.5 * iqr) | (s > q3 + 1.5 * iqr)).sum())

    group_summary["outliers"] = df.groupby(group_col)[value_col].apply(count_outliers)
    group_summary["mean_minus_median"] = group_summary["mean"] - group_summary["median"]

    print("\nQuestions:")
    print(f"1. Highest average {value_col}: {group_summary['mean'].idxmax()} ({group_summary['mean'].max():.2f})")
    print(f"2. Greatest variation (std): {group_summary['std'].idxmax()} ({group_summary['std'].max():.2f})")
    print("3. Mean vs median gap per group:")
    print(group_summary[["mean", "median", "mean_minus_median"]].round(2).to_string())
    print("4. Possible outliers per group (could be dragging the mean up):")
    print(group_summary["outliers"].to_string())
    print()


compare_groups(df, "Pclass", "Fare")
compare_groups(df, "Sex", "Age")
compare_groups(df, "Pclass", "Age")

# Survival rate is just the mean of a 0/1 column
print("===== Survival rate by Pclass and Sex =====")
print(df.groupby(["Pclass", "Sex"])["Survived"].agg(["count", "mean"]).round(3))
