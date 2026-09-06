# modules we'll use
import pandas as pd
import numpy as np

# read in all our data
sf_permits= pd.read_csv("C:\\Users\\Nabiswa\\Desktop\\100DaysOfCode\\100-Days-of-Code-AI-Engineering\\Python\\DataCleaning\\Building_Permits.csv")

# set seed for reproducibility
np.random.seed(0) 

#PRINT FIRST 5 ROWS OF DATAFRAME

sf_permits.head(5)

#List of columns in the dataframe
sf_permits.columns

#Check the date columns in the dataframe
sf_permits.dtypes


#PARSING ONE COLUMN OF DATES
#checking the length of each entry in the "Date" column.
sf_permits_current_status_date = sf_permits['Current Status Date']
sf_permits_current_status_date.head(5)

date_lengths = sf_permits_current_status_date.str.len()

date_lengths.value_counts()

sf_permits_current_status_date_parsed = pd.to_datetime(sf_permits_current_status_date, format="%m/%d/%Y", errors='coerce')

current_status_date_parsed_days = sf_permits_current_status_date_parsed.dt.day


#PARSING MULTIPLE COLUMNS OF DATES
sf_date_columns = sf_permits[['Current Status Date','Issued Date', 'Filed Date', 'Completed Date']]
sf_date_columns.head(5)

#This line of code will parse the date columns in the dataframe and convert them to datetime format. The errors='coerce' argument will replace any invalid date formats with NaT (Not a Time) values. 

#It also adds the parsed date columns to the original dataframe with new column names.
sf_date_columns[['Current Status Date Parsed', 'Issued Date Parsed', 'Filed Date Parsed', 'Completed Date Parsed']] = sf_date_columns.apply(pd.to_datetime,format="%m/%d/%Y", errors='coerce')
sf_date_columns.head(5)





#This stores the parsed date columns in a new dataframe called sf_date_columns_parsed.
sf_date_columns_parsed = sf_date_columns[['Current Status Date Parsed', 'Issued Date Parsed', 'Filed Date Parsed', 'Completed Date Parsed']]

sf_date_columns_parsed.head(5)


# Your CSV's dates are actually MM/DD/YYYY (e.g. 12/21/2017, 05/06/2015 — see Building_Permits.csv), but the code parses them with:


# format="%d/%m/%Y"
# That's day-first. So for a date like 12/21/2017, pandas reads it as day=12, month=21 — an invalid month — and with errors='coerce' it silently becomes NaT instead of raising an error. Any date where the "day" slot (second number) is >12 will fail this way, which is most of your rows (days 13–31), while the ones with day ≤12 will parse "successfully" but with month/day swapped — giving wrong dates rather than missing ones.

# sf_date_columns = sf_permits[['Current Status Date','Issued Date', 'Filed Date', 'Completed Date']]
# sf_date_columns.head(5)

# sf_date_columns[['Current Status Date Parsed', 'Issued Date Parsed', 'Filed Date Parsed', 'Completed Date Parsed']] = sf_date_columns.apply(pd.to_datetime,format="%d/%m/%Y", errors='coerce')
# sf_date_columns.head(5)

# sf_date_columns_parsed = sf_date_columns[['Current Status Date Parsed', 'Issued Date Parsed', 'Filed Date Parsed', 'Completed Date Parsed']]

# sf_date_columns_parsed.head(5)


#select the day of the month from the parsed date columns and store them in a new dataframe called sf_date_columns_day.
sf_date_columns_day = sf_date_columns_parsed.apply(lambda x: x.dt.day)

sf_date_columns_day.head(5)
sf_date_columns_day.dtypes

sf_date_columns_day.describe()

sf_date_columns_month = sf_date_columns_parsed.apply(lambda x: x.dt.month)
sf_date_columns_month.head(5)


#Plot the day of the month to check the date parsing

import matplotlib.pyplot as plt
import seaborn as sns

#create graph to visualize the distribution of the day of the month in the parsed date columns per column. This will help us identify any patterns or anomalies in the data.

sf_date_columns_day_cleaned = sf_date_columns_day.dropna()

sns.histplot(data=sf_date_columns_day_cleaned['Current Status Date Parsed'], bins=31, kde=False, color='blue')
sns.histplot(data=sf_date_columns_day_cleaned['Issued Date Parsed'], bins=31, kde=False, color='green')
sns.histplot(data=sf_date_columns_day_cleaned['Filed Date Parsed'], bins=31, kde=False, color='red')
sns.histplot(data=sf_date_columns_day_cleaned['Completed Date Parsed'], bins=31, kde=False, color='orange')


sf_date_columns_month_cleaned = sf_date_columns_month.dropna()

sns.histplot(data=sf_date_columns_month_cleaned['Current Status Date Parsed'], bins=12, kde=False, color='blue')
sns.histplot(data=sf_date_columns_month_cleaned['Issued Date Parsed'], bins=12, kde=False, color='green')
sns.histplot(data=sf_date_columns_month_cleaned['Filed Date Parsed'], bins=12, kde=False, color='red')
sns.histplot(data=sf_date_columns_month_cleaned['Completed Date Parsed'], bins=12, kde=False, color='orange')