
from pathlib import Path


import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.linear_model import LinearRegression


sns.set()

# Load the data (path is relative to this script, so it runs from any folder)
data = pd.read_csv(Path(__file__).parent / "sat_gpa.csv")
print(data.head())
print(data.describe())

# Dependent variable: GPA, independent variable: SAT
x = data['SAT']
y = data['GPA']

# sklearn expects the inputs as a 2D matrix: (n_samples, n_features)
x_matrix = x.values.reshape(-1, 1)

reg = LinearRegression()
reg.fit(x_matrix, y)

print(f"\nR-squared: {reg.score(x_matrix, y):.4f}")
print(f"Intercept: {reg.intercept_:.4f}")
print(f"Coefficient: {reg.coef_[0]:.6f}")

# Predict GPA for a student with an SAT score of 1740
# predict() also needs a 2D input, so reg.predict(1740) would raise an error
new_sat = [[1740]]
predicted_gpa = reg.predict(new_sat)
print(f"Predicted GPA for SAT 1740: {predicted_gpa[0]:.2f}")

# Scatter plot with the regression line
plt.scatter(x, y)
yhat = reg.intercept_ + reg.coef_[0] * x
plt.plot(x, yhat, lw=3, c='orange', label='regression line')
plt.xlabel('SAT', fontsize=20)
plt.ylabel('GPA', fontsize=20)
plt.legend()
plt.show()

