from google.cloud import bigquery
#python -m pip install google-cloud-bigquery

#STEP 1: CREATE A CLIENT OBJECT
client = bigquery.Client(project="daysofcode-508608")

#Construct a reference to the hacker_news dataset

#old method 
# dataset_ref = client.dataset("hacker_news", project = "bigquery-public-data")


dataset_ref = client.get_dataset("bigquery-public-data.hacker_news")
bigquery.DatasetReference("bigquery-public-data", "hacker_news")

dataset = client.get_dataset(dataset_ref)

#List of all the tables in the "Hacker_news" dataset

tables = list(client.list_tables(dataset))

for table in tables:
    print(table.table_id)
    
num_tables = len(tables)

#Construct a reference to the "full" table

table_ref = dataset_ref.table("full")

# API request - fetch the table
table = client.get_table(table_ref)

#Print info on all the columns in the full table in the hacker_news dataset
table.schema

type(table.schema)

for field in table.schema:
    if field.name == "timestamp":
        print(field.field_type)  # 'TIMESTAMP'


#Preview the first five lines of the "full" table

rows = client.list_rows(table, max_results=10).to_dataframe()

rows

# Preview the first five entries in the "by" column of the "full" table

byrows = client.list_rows(table, selected_fields=table.schema[:4], max_results=5).to_dataframe()

byrows