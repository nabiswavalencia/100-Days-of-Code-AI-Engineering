# SQL Practice

A small local database for practicing SQL fundamentals.

## Files
- `schema.sql` — creates the `employees` table.
- `seed_data.sql` — inserts sample rows to query against.
- `practice_queries.sql` — exercises to fill in yourself.

## How to run (SQLite)
```bash
sqlite3 practice.db < schema.sql
sqlite3 practice.db < seed_data.sql
sqlite3 practice.db
```
Then write and test your answers from `practice_queries.sql` inside the `sqlite3` prompt (or any DB client — the SQL is standard and works in MySQL/Postgres too, with minor tweaks).
