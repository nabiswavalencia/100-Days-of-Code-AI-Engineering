# Chakula Combos

Type in your budget in KES and get the best Kenyan meal combo you can afford, ranked by rating and popularity, and never the same meal you had yesterday.

For the full story of how this was built, day by day, see [THOUGHT_PROCESS.md](THOUGHT_PROCESS.md).

## Stack

- **React** (frontend): the menu, budget box, top picks and Order button
- **Python + NumPy** (`backend/engine.py`): z-score scoring and combo building
- **FastAPI** (`backend/app.py`): the API between React and Python
- **SQLite** (`backend/meals.db`): the menu and order history

## Run it

```
# Terminal 1: backend
cd backend
pip install -r requirements.txt
python setup_db.py                    # first time only (running it again resets the data)
python -m uvicorn app:app --reload

# Terminal 2: frontend
cd frontend
npm install
npm run dev                           # open http://localhost:5173
```

The API also has an interactive test page at http://localhost:8000/docs.

## Tests

```
# Backend: 42 tests (engine maths, database, API)
cd backend
pip install -r requirements-dev.txt
python -m pytest

# Frontend: 25 tests (components and the full app with a fake API)
cd frontend
npm test
```

Tests use a temporary database, so they never touch your real `meals.db`.

## API

| Endpoint | What it does |
|---|---|
| `GET /api/menu` | The full menu, grouped by slot |
| `GET /api/recommend?budget=150&history=pilau` | The top combos within budget |
| `POST /api/orders` with `{"item_ids": ["pilau", "chai"]}` | Saves an order |
