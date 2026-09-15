from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from google.cloud import bigquery

app = FastAPI()

PROJECT_ID = "daysofcode-508608"
DATASET_ID = "titanic"
TABLE_ID = "passengers"
TABLE = f"`{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`"

client = bigquery.Client(project=PROJECT_ID)


def run_query(sql, params=None):
    """Runs a SQL query against BigQuery and returns the resulting rows."""
    job_config = bigquery.QueryJobConfig(
        maximum_bytes_billed=10**10,
        query_parameters=params or [],
    )
    return list(client.query(sql, job_config=job_config).result())


@app.get("/api/overview")
def get_overview():
    """Runs a handful of SQL queries to summarize the Titanic passenger data."""
    total = run_query(f"SELECT COUNT(*) AS n FROM {TABLE}")[0]["n"]
    survived = run_query(f"SELECT COUNT(*) AS n FROM {TABLE} WHERE survived = 1")[0]["n"]
    died = run_query(f"SELECT COUNT(*) AS n FROM {TABLE} WHERE survived = 0")[0]["n"]
    children = run_query(f"SELECT COUNT(*) AS n FROM {TABLE} WHERE age < 18")[0]["n"]
    adults = run_query(f"SELECT COUNT(*) AS n FROM {TABLE} WHERE age >= 18")[0]["n"]
    unknown_age = run_query(f"SELECT COUNT(*) AS n FROM {TABLE} WHERE age IS NULL")[0]["n"]
    avg_age = run_query(f"SELECT AVG(age) AS avg_age FROM {TABLE} WHERE age IS NOT NULL")[0]["avg_age"]
    avg_fare = run_query(f"SELECT AVG(fare) AS avg_fare FROM {TABLE}")[0]["avg_fare"]

    by_class = [
        dict(row)
        for row in run_query(
            f"""
            SELECT pclass, COUNT(*) AS total, SUM(survived) AS survived
            FROM {TABLE}
            GROUP BY pclass
            ORDER BY pclass
            """
        )
    ]
    by_sex = [
        dict(row)
        for row in run_query(
            f"""
            SELECT sex, COUNT(*) AS total, SUM(survived) AS survived
            FROM {TABLE}
            GROUP BY sex
            """
        )
    ]

    return {
        "total": total,
        "survived": survived,
        "died": died,
        "children": children,
        "adults": adults,
        "unknown_age": unknown_age,
        "avg_age": round(avg_age, 1),
        "avg_fare": round(avg_fare, 2),
        "by_class": by_class,
        "by_sex": by_sex,
    }


@app.get("/api/passengers")
def get_passengers(
    pclass: int | None = Query(default=None),
    sex: str | None = Query(default=None),
    survived: int | None = Query(default=None),
    limit: int = Query(default=25, le=200),
):
    """Filters the passengers table based on whichever query params were provided."""
    conditions = []
    params = []

    if pclass is not None:
        conditions.append("pclass = @pclass")
        params.append(bigquery.ScalarQueryParameter("pclass", "INT64", pclass))
    if sex is not None:
        conditions.append("sex = @sex")
        params.append(bigquery.ScalarQueryParameter("sex", "STRING", sex))
    if survived is not None:
        conditions.append("survived = @survived")
        params.append(bigquery.ScalarQueryParameter("survived", "INT64", survived))

    params.append(bigquery.ScalarQueryParameter("limit", "INT64", limit))

    sql = f"SELECT name, sex, age, pclass, fare, survived FROM {TABLE}"
    if conditions:
        sql += " WHERE " + " AND ".join(conditions)
    sql += " LIMIT @limit"

    try:
        rows = [dict(row) for row in run_query(sql, params)]
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {"count": len(rows), "passengers": rows}


# Mount the static folder to serve HTML/JS directly
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
