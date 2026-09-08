import pandas as pd
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split

from sklearn.metrics import mean_absolute_error

my_data = pd.read_csv("train.csv")
my_data.head()

y = my_data['SalePrice']
feature_columns = ['LotArea', 'YearBuilt', '1stFlrSF', '2ndFlrSF', 'FullBath', 'BedroomAbvGr', 'TotRmsAbvGrd']
X = my_data[feature_columns]

my_insample_model = DecisionTreeRegressor(random_state=1)
my_insample_model.fit(X, y)

print("First in-sample predictions:", my_insample_model.predict(X.head()))
print("Actual target values for those homes:", y.head().tolist())
mean_absolute_error1 = mean_absolute_error(y, my_insample_model.predict(X))
print("Mean Absolute Error (MAE) for in-sample predictions:", mean_absolute_error1)

#Split the data into training and validation data

X_train, X_val, y_train, y_val = train_test_split(X, y, random_state=1)

#Train model on training data
my_outsample_model = DecisionTreeRegressor(random_state=1)
my_outsample_model.fit(X_train, y_train)  

#Make predictions on validation data
val_predictions = my_outsample_model.predict(X_val)

# print the top few validation predictions
print("Validation predictions:", val_predictions[:5])

# print the top few actual prices from validation data
print("Actual prices from validation data:", y_val[:5].tolist())


#Calculate mean absolute error (MAE) for validation predictions
 

mean_absolute_error2 = mean_absolute_error(y_val, val_predictions)
print(f"Mean Absolute Error (MAE) for validation predictions: {mean_absolute_error2}")



