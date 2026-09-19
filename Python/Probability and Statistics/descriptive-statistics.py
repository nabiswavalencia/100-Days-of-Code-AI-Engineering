# Step 1 - Descriptive statistics on a real dataset (Titanic)
# The numbers matter less than being able to say what they mean in plain language.

from titanic_data import load_titanic

df = load_titanic()


def describe_column(df, column):
    s = df[column].dropna()  # describe() and friends skip NaN, so be explicit

    summary = s.describe()
    mean = s.mean()
    median = s.median()
    mode = s.mode().iloc[0]  # mode() returns a Series (there can be ties)
    std = s.std()
    variance = s.var()
    q1, q3 = s.quantile(0.25), s.quantile(0.75)
    iqr = q3 - q1

    # Tukey's rule: values beyond 1.5 * IQR from the quartiles are possible outliers
    lower_fence, upper_fence = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    n_outliers = int(((s < lower_fence) | (s > upper_fence)).sum())

    print(f"===== {column} =====")
    print(summary)
    print(f"Mean: {mean:.2f}")
    print(f"Median: {median:.2f}")
    print(f"Mode: {mode}")
    print(f"Standard deviation: {std:.2f}")
    print(f"Variance: {variance:.2f}")
    print(f"IQR: {iqr:.2f}")
    print(f"Possible outliers (1.5*IQR rule): {n_outliers} of {len(s)}")

    print("\nIn plain language:")

    missing = len(df) - len(s)
    if missing:
        print(f"- {missing} of {len(df)} passengers have no {column}, so these figures use {len(s)} rows.")

    gap = mean - median
    relative_gap = abs(gap) / std
    if relative_gap < 0.1:
        print(f"- The mean ({mean:.1f}) and median ({median:.1f}) are close, so the {column} values are roughly symmetric.")
    else:
        direction, side = ("higher", "right") if gap > 0 else ("lower", "left")
        strength = "slightly" if relative_gap < 0.3 else "clearly"
        pull = "large" if gap > 0 else "small"
        print(
            f"- The mean ({mean:.1f}) is {direction} than the median ({median:.1f}): a few {pull} values "
            f"pull the average, so the distribution is {strength} {side}-skewed. "
            f"The median is the better 'typical' value."
        )

    cv = std / mean
    if cv > 0.5:
        level = "vary a lot"
    elif cv > 0.25:
        level = "vary moderately"
    else:
        level = "stay fairly close"
    print(f"- The standard deviation of {std:.1f} against a mean of {mean:.1f} shows {column} values {level} around the average.")

    print(f"- The middle 50% of passengers have {column} between {q1:.1f} and {q3:.1f} (IQR = {iqr:.1f}).")

    if n_outliers:
        print(
            f"- {n_outliers} passengers sit outside [{lower_fence:.1f}, {upper_fence:.1f}]. "
            f"The largest value is {s.max():.1f}; the mean and standard deviation react to these extremes far more than the median does."
        )
    else:
        print("- No values fall outside the 1.5*IQR fences.")
    print()


describe_column(df, "Age")
describe_column(df, "Fare")
