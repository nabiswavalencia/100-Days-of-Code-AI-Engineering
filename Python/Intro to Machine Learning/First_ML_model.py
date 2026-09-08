import pandas as pd

my_data = pd.read_csv("train.csv")
my_data.head()
my_data.columns
my_data.describe(include='all')


#selecting a single column for prediction

Y = my_data['SalePrice']
# y = my_data.SalePrice



#Selecting multiple columns for prediction
X = my_data[['OverallQual', 'GrLivArea', 'GarageCars', 'TotalBsmtSF', 'FullBath', 'YearBuilt']]

X.columns
X.head()
X.describe(include='all')

#defining a decision tree model with scikit-learn and fitting it with the features and target variable

from sklearn.tree import DecisionTreeRegressor

selling_price_model = DecisionTreeRegressor(random_state=1)# Specifying a number for random_state ensures you get the same results in each run
selling_price_model.fit(X, Y)


print("Making predictions for the following 5 houses:")
print(X.head())
print("The predictions are")
print(selling_price_model.predict(X.head()))


pricecomparison = pd.DataFrame({'Actual Price': Y.head(), 'Predicted Price': selling_price_model.predict(X.head())})