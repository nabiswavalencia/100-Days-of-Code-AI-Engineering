# Data Loading Code Runs At This Point
import pandas as pd
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
    
# Load data
my_file_path = 'train.csv'
my_data = pd.read_csv(my_file_path)

# Choose target and features
feature_names = ['LotArea', 'YearBuilt', '1stFlrSF', '2ndFlrSF', 'FullBath', 'BedroomAbvGr', 'TotRmsAbvGrd']

# Keep only the columns we need, then drop rows with missing values in those columns
filtered_my_data = my_data[feature_names + ['SalePrice']]

cleaned_data = filtered_my_data.dropna(axis=0)

y = cleaned_data.SalePrice
X = cleaned_data[feature_names]


# split data into training and validation data, for both features and target
train_X, val_X, train_y, val_y = train_test_split(X, y , random_state = 1)

from sklearn.ensemble import RandomForestRegressor

forest_model = RandomForestRegressor(random_state=1)
forest_model.fit(train_X, train_y)
melb_preds = forest_model.predict(val_X)
print(mean_absolute_error(val_y, melb_preds))