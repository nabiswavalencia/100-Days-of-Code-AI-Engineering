# modules we'll use
import pandas as pd
import numpy as np
# for min_max scaling
from sklearn.preprocessing import minmax_scale
# for Box-Cox Transformation
from scipy import stats

# plotting modules
import matplotlib.pyplot as plt
import seaborn as sns

# set seed for reproducibility
np.random.seed(0)

# read in our data
kickstarter = pd.read_csv("C:\\Users\\Nabiswa\\Desktop\\100DaysOfCode\\100-Days-of-Code-AI-Engineering\\Python\\DataCleaning\\kickstarter_projects.csv")

# PRINT FIRST 5 ROWS OF DATAFRAME
kickstarter.head(5)

# ---------------------------------------------------------------------------
# SCALING vs NORMALIZATION
#
# Scaling: change the RANGE of your data (e.g. 0-1) without changing its shape.
#          Useful for methods that care about distance/magnitude, like SVM or KNN,
#          so that features measured in different units (dollars vs days) are
#          comparable.
#
# Normalization: change the SHAPE of the distribution of your data so it more
#          closely resembles a normal (Gaussian) distribution. Useful for methods
#          that assume normally distributed data, like linear discriminant
#          analysis (LDA) or Gaussian naive Bayes.
# ---------------------------------------------------------------------------

# SCALING: min-max scale the goal_usd column into the range [0, 1]
original_goal_data = kickstarter.goal_usd

scaled_goal_data = pd.Series(
    minmax_scale(original_goal_data, feature_range=(0, 1)),
    index=original_goal_data.index
)

print('Original data\nPreview:\n', original_goal_data.head())
print('Minimum value:', float(original_goal_data.min()),
      '\nMaximum value:', float(original_goal_data.max()))
print('_'*30)

print('\nScaled data\nPreview:\n', scaled_goal_data.head())
print('Minimum value:', float(scaled_goal_data.min()),
      '\nMaximum value:', float(scaled_goal_data.max()))
# plot the original & scaled data side by side to see that only the range changed
fig, ax = plt.subplots(1, 2, figsize=(12, 4))
ax[0].hist(original_goal_data, bins=30, color="steelblue")
ax[0].set_title("Original goal_usd")
ax[1].hist(scaled_goal_data, bins=30, color="steelblue")
ax[1].set_title("Scaled goal_usd (0-1)")
plt.tight_layout()
plt.savefig("Python/DataCleaning/scaling_example.png")
plt.close(fig)

print(f"Original goal_usd range: {original_goal_data.min()} to {original_goal_data.max()}")
print(f"Scaled goal_usd range: {scaled_goal_data.min()} to {scaled_goal_data.max()}")

# NORMALIZATION: use a Box-Cox transformation to make goal_usd more normally
# distributed. Box-Cox requires strictly positive values, which goal_usd
# satisfies (every project has a goal > 0).
normalized_goal_data, _lambda = stats.boxcox(original_goal_data)
print(f"Normalization lambda: {_lambda:.2f}")

# plot the original & normalized data side by side to see the shape change
fig, ax = plt.subplots(1, 2, figsize=(12, 4))
ax[0].hist(original_goal_data, bins=30, color="darkorange")
ax[0].set_title("Original goal_usd (right-skewed)")
ax[1].hist(normalized_goal_data, bins=30, color="darkorange")
ax[1].set_title("Normalized goal_usd (Box-Cox)")
plt.tight_layout()
plt.savefig("Python/DataCleaning/normalization_example.png")
plt.close(fig)

print(f"Skew before normalization: {stats.skew(original_goal_data):.2f}")
print(f"Skew after normalization: {stats.skew(normalized_goal_data):.2f}")

# EXERCISE: try the same scaling & normalization on the backers_count column,
# which is also right-skewed
original_backers_data = kickstarter.backers_count
scaled_backers_data = minmax_scale(original_backers_data, feature_range=(0, 1))
# NOTE: backers_count contains zeros, so Box-Cox (which requires values > 0)
# would fail here - this is a good example of why you should always check
# your data's assumptions before applying a transformation
