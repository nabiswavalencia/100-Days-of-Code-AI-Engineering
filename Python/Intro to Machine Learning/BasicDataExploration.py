import pandas as pd


# Sample DataFrame
salary_data = {
    'Age': [25, 30, 35, 40, 45],
    'Salary': [50000, 60000, 75000, 80000, 120000]
}
salary_df = pd.DataFrame(salary_data)

# Applying describe()
print(salary_df.describe())

# Sample DataFrame with non-numeric data
employee_data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'David', 'Eva'],
    'Department': ['HR', 'IT', 'Finance', 'IT', 'HR']
}
employee_df = pd.DataFrame(employee_data)

# Describing non-numerical (object) data
print(employee_df.describe(include='object'))


## Sample DataFrame with mixed data types

#LOAD DATA
my_data = pd.read_csv("train.csv")

#REVIEW DATA
my_data.head()
my_data.describe(include='all')
