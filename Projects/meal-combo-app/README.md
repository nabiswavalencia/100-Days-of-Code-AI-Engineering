# Chakula Combos

Version 2 of the app: a rebuild with a new design and more features. (Version 1, the single-menu app from Days 37–42, is saved in Git: `git checkout v1`.) You sign in as one of three demo profiles, pick one of four restaurants, and each restaurant has its own Home, Our Menu, Your Orders and **Recommendations** page. The recommendation engine (NumPy z-scores, every main + side + drink combo, budget and history filters) is the same one from v1, now run on each restaurant's own menu.

All restaurants, people and orders are fictional. Every dish has a real photo, from Wikimedia Commons and Pexels; see [CREDITS.md](CREDITS.md).

- [DESIGN.md](DESIGN.md): the design decisions every component follows
- [AUDIT.md](AUDIT.md): what was wrong with the v1 UI, so it isn't repeated
- [screenshots/](screenshots/): before (v1) and after (v2), desktop and mobile

## Stack

- **React 19 + Vite + Tailwind v4** (frontend), with React Router, Motion and Phosphor icons
- **FastAPI + SQLite + NumPy** (backend): `engine.py` is unchanged from v1 apart from taking the menu as an argument

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

## Tests

```
cd backend && python -m pytest        # 87 tests: engine, database, API, recent dishes
cd frontend && npm test               # 40 tests: helpers and the whole app against a fake API
```

## API

| Endpoint | What it does |
|---|---|
| `GET /api/users` | The 3 demo profiles |
| `POST /api/login` with `{"user_id": "achieng"}` | Demo login (no password) |
| `GET /api/users/{user}/orders?restaurant=moto` | A user's orders, newest first |
| `GET /api/users/{user}/recent-items?restaurant=moto&hours=24` | Dishes they ordered there in the last 24 hours (`hours` 1–168) |
| `GET /api/restaurants` | All restaurants with their price range |
| `GET /api/restaurants/{id}` | One restaurant, with today's specials |
| `GET /api/restaurants/{id}/menu` | Its menu, grouped by slot |
| `GET /api/restaurants/{id}/recommend?budget=300&history=mw-pilau` | The top combos within budget |
| `POST /api/orders` with `{"user_id", "restaurant_id", "item_ids"}` | Places an order |

## What changed from v1

- One restaurant became **four**, each with its own menu, prices, specials and accent colour.
- **Demo login** with three profiles. Your orders are saved per person, and everything you ordered at that restaurant in the **last 24 hours** fills in the "skip" list automatically (v1 forgot "ate yesterday" on refresh).
- **Special prices** apply everywhere: menu, recommendations and order totals.
- The budget box **waits for you to stop typing** before asking the API, and the budget and skipped dishes are kept **in the URL**.
- Every Order button says what it orders, controls are at least 44px, and errors come with a **Try again** button.
