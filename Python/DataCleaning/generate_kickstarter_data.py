# quick script to generate a synthetic dataset for the scaling & normalization tutorial
# (mimics the shape of real-world crowdfunding data: goal amounts are right-skewed/exponential,
# backer counts are right-skewed, campaign duration in days is roughly normal)

import numpy as np
import pandas as pd

np.random.seed(0)

n_rows = 1000

categories = ["Technology", "Music", "Film & Video", "Games", "Publishing", "Food", "Art"]

df = pd.DataFrame({
    "project_id": np.arange(1, n_rows + 1),
    "category": np.random.choice(categories, size=n_rows),
    # goal amounts (USD): exponential distribution, like real fundraising goals
    "goal_usd": np.round(np.random.exponential(scale=5000, size=n_rows) + 100, 2),
    # number of backers: also right-skewed
    "backers_count": np.random.exponential(scale=80, size=n_rows).astype(int),
    # campaign duration in days: roughly normal, clipped to a realistic range
    "duration_days": np.clip(np.random.normal(loc=30, scale=8, size=n_rows), 5, 60).round().astype(int),
})

df.to_csv("Python/DataCleaning/kickstarter_projects.csv", index=False)
print(f"Wrote {len(df)} rows to kickstarter_projects.csv")
print(df.head())
