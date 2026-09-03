# modules we'll use
import pandas as pd
import numpy as np

# read in all our data
sf_permits= pd.read_csv("C:\\Users\\Nabiswa\\Desktop\\100DaysOfCode\\100-Days-of-Code-AI-Engineering\\Python\\DataCleaning\\Building_Permits.csv")

# set seed for reproducibility
np.random.seed(0) 

#PRINT FIRST 5 ROWS OF DATAFRAME

sf_permits.head(5)

#CHECK MISSING DATA
# get the number of missing data points per column
missing_values_count = sf_permits.isnull().sum()

# how many total missing values do we have?

total_missing = missing_values_count.sum()

#DROP MISSING VALUES : ROWS
sf_permits_cleaned_rows = sf_permits.dropna()

#DROP MISSING VALUES : COLUMNS

# remove all columns with at least one missing value
sf_permits_with_na_dropped = sf_permits.dropna(axis=1)

# calculate number of dropped columns
cols_in_original_dataset = sf_permits.shape[1]
cols_in_na_dropped = sf_permits_with_na_dropped.shape[1]
dropped_columns = cols_in_original_dataset - cols_in_na_dropped

#FILL MISSING VALUES : CONSTANT VALUE
#fill all NA entries with 0
sf_permits_filled_constant = sf_permits.fillna(0)


