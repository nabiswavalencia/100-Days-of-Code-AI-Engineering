# RMS Titanic: The Story in Data

A small full-stack project combining Python, SQL, and JavaScript: a storytelling page about the Titanic disaster, backed by a BigQuery table of the 891 passengers in the classic Kaggle Titanic dataset.

## Stack
- **Python** — loads the CSV into BigQuery (`setup_db.py`).
- **SQL** — `SELECT`, `WHERE`, `GROUP BY`, `COUNT`, `AVG` queries power the stats and filters, run through the `google-cloud-bigquery` client (`app.py`).
- **FastAPI** — serves the JSON API and the static frontend.
- **JavaScript** — `fetch`, `addEventListener`, and DOM manipulation render the stats, chart, and passenger table (`frontend/index.html`).

## Data
`data/titanic.csv` is the standard 891-row Kaggle Titanic training set (passenger name, sex, age, class, fare, and survival outcome). It's a well-known public dataset, originally from [Kaggle's Titanic competition](https://www.kaggle.com/competitions/titanic).

## Google Cloud setup
This project loads data into and queries a BigQuery table, so it needs:
1. A Google Cloud project with the BigQuery API enabled (`setup_db.py` and `app.py` are both set to use `daysofcode-508608` — change `PROJECT_ID` in each file if you want a different project).
2. Local credentials: `gcloud auth application-default login`.

The dataset (`titanic`) and table (`passengers`) are created automatically by `setup_db.py`. At 891 rows, storage and query volume stay well within BigQuery's free tier.

## How to run

```bash
cd Projects/titanic-project
pip install -r requirements.txt
python setup_db.py     # loads the CSV into BigQuery
python app.py           # starts the server at http://127.0.0.1:8000
```

Then open http://127.0.0.1:8000 in your browser.

## API endpoints
- `GET /api/overview` — total passengers, survived/died counts, children/adult counts, average age and fare, and breakdowns by class and sex.
- `GET /api/passengers?pclass=&sex=&survived=&limit=` — filtered list of passengers.
