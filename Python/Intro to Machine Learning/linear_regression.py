import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

my_data = pd.read_csv("train.csv")

y = my_data['SalePrice']
feature_columns = ['LotArea', 'YearBuilt', '1stFlrSF', '2ndFlrSF', 'FullBath', 'BedroomAbvGr', 'TotRmsAbvGrd']
X = my_data[feature_columns]

X_train, X_val, y_train, y_val = train_test_split(X, y, random_state=1)

# --- Simple linear regression: a single feature ---

single_feature_model = LinearRegression()
single_feature_model.fit(X_train[[feature_columns[0]]], y_train)
single_val_predictions = single_feature_model.predict(X_val[[feature_columns[0]]])

print(f"Simple regression on '{feature_columns[0]}' only:")
print(f"  Coefficient: {single_feature_model.coef_[0]:.2f}")
print(f"  Intercept: {single_feature_model.intercept_:.2f}")
print(f"  MAE: {mean_absolute_error(y_val, single_val_predictions):.2f}")
print(f"  R^2: {r2_score(y_val, single_val_predictions):.3f}")

# --- Multiple linear regression: every feature together ---

my_model = LinearRegression()
my_model.fit(X_train, y_train)
val_predictions = my_model.predict(X_val)

print(f"\nMultiple regression on {feature_columns}:")
for feature, coef in zip(feature_columns, my_model.coef_):
    print(f"  {feature}: {coef:.2f}")
print(f"  Intercept: {my_model.intercept_:.2f}")

mae = mean_absolute_error(y_val, val_predictions)
r2 = r2_score(y_val, val_predictions)
print(f"  MAE: {mae:.2f}")
print(f"  R^2: {r2:.3f}")

# Coefficients are directly readable: e.g. holding every other feature fixed,
# each extra unit of 'YearBuilt' shifts the predicted SalePrice by its coefficient.
# That interpretability is what LinearRegression trades for the accuracy a
# DecisionTreeRegressor/RandomForestRegressor gets by fitting non-linear splits.

comparison = pd.DataFrame({'Actual Price': y_val.head(), 'Predicted Price': val_predictions[:5]})
print("\n", comparison)
