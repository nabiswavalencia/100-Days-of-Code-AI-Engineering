"""Loads the Titanic CSV into a BigQuery table.

Requires a Google Cloud project with the BigQuery API enabled, and local
credentials (e.g. `gcloud auth application-default login`).

Run this once (or whenever data/titanic.csv changes) before starting app.py:
    python setup_db.py
"""

from google.cloud import bigquery

PROJECT_ID = "daysofcode-508608"
DATASET_ID = "titanic"
TABLE_ID = "passengers"
CSV_PATH = "data/titanic.csv"

client = bigquery.Client(project=PROJECT_ID)

# Create the dataset if it doesn't already exist
dataset_ref = bigquery.DatasetReference(PROJECT_ID, DATASET_ID)
client.create_dataset(dataset_ref, exists_ok=True)

table_ref = dataset_ref.table(TABLE_ID)
job_config = bigquery.LoadJobConfig(
    source_format=bigquery.SourceFormat.CSV,
    skip_leading_rows=1,
    autodetect=True,
    write_disposition="WRITE_TRUNCATE",
)

with open(CSV_PATH, "rb") as csv_file:
    load_job = client.load_table_from_file(csv_file, table_ref, job_config=job_config)
load_job.result()

table = client.get_table(table_ref)
print(f"Loaded {table.num_rows} passengers into {PROJECT_ID}.{DATASET_ID}.{TABLE_ID}")
