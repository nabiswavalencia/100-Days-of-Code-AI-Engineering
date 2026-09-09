# Data Loading Code Runs At This Point
import pandas as pd
from sklearn.metrics import mean_absolute_error
from sklearn.tree import DecisionTreeRegressor

    
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

from sklearn.model_selection import train_test_split

# split data into training and validation data, for both features and target
train_X, val_X, train_y, val_y = train_test_split(X, y , random_state = 1)


#We can use a utility function to help compare MAE scores from different values for max_leaf_nodes:
def get_mae(max_leaf_nodes, train_X, val_X, train_y, val_y):
    model = DecisionTreeRegressor(max_leaf_nodes=max_leaf_nodes, random_state=0)
    model.fit(train_X, train_y) #fit your model using training inputs and training targets
    preds_val = model.predict(val_X) #predict using the validation inputs and store the predications in a variable called preds_val
    mae = mean_absolute_error(val_y, preds_val) # et the mean absolute error between the validation targets and your predications
    return(mae)


#compare different tree sizes
for max_leaf_nodes in [5, 50, 500, 5000]:
    my_ideal_mae = get_mae(max_leaf_nodes, train_X, val_X, train_y, val_y)
    print("Max leaf nodes: %d  \t\t Mean Absolute Error:  %d" %(max_leaf_nodes, my_ideal_mae))

#store the best value of max_leaf_nodes
scores = {max_leaf_nodes: get_mae(max_leaf_nodes, train_X, val_X, train_y, val_y) for max_leaf_nodes in [5, 50, 500, 5000]}
#creates a dictionary where key = max_leaf_node and value = the result from the get_mae function

best_tree_size = min(scores, key=scores.get)