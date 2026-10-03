# Chakula Combos: The Thought Process

A day-by-day story of how this app went from a maths question to a working app: what I built, why I built it, and what's inside each file.

---

## The idea in one paragraph

You open the app, type how much money you have (say KES 150), and it tells you the best meal combo you can afford, like **Chapati & Beans + Chai**. It doesn't just pick the cheapest food. It picks food that is **well rated and popular**, and it won't suggest the same meal you had yesterday. Every time someone orders, the app remembers, so popular combos rise to the top.

## The big picture

The app has three layers. Each one has a single job:

```
┌──────────────────────────┐
│  React (frontend)        │  The face: what you see and click
└────────────┬─────────────┘
             │  asks questions over the internet ("what can I get for KES 150?")
┌────────────▼─────────────┐
│  FastAPI (backend)       │  The waiter: takes requests, brings back answers
│  + engine.py (Python)    │  The brain: does the maths and picks the combos
└────────────┬─────────────┘
             │  reads and writes
┌────────────▼─────────────┐
│  SQLite (meals.db)       │  The filing cabinet: menu and order history
└──────────────────────────┘
```

---

## Day 34: The spark (pure maths)

**What happened:** I asked a simple question: *how are variations with and without repetition calculated?*

To make it real, I imagined a **3-tier cake** with **4 flavours** (Vanilla, Chocolate, Strawberry, Lemon).

**What I learned:**

- **Order matters in variations.** Vanilla-Chocolate-Lemon and Vanilla-Lemon-Chocolate are *different* cakes, because the layers are in different places.
- **Without repetition** (every tier a different flavour): 4 × 3 × 2 = **24** cakes.
- **With repetition** (flavours can repeat): 4 × 4 × 4 = **64** cakes.
- I worked it out "the long way" by fixing one flavour on the bottom tier and listing everything that could go on top. That made the multiplying make sense.

**Why it matters:** this idea of "pick one option for each slot, and count every possibility" is the core of the whole app.

---

## Day 35: From cakes to meals (the idea grows)

**What happened:** I swapped cake tiers for **meal slots**: a main, a side and a drink.

**The key realisation:** picking one item from *different* lists (one main, one side, one drink) is called a **Cartesian product**. It's like the cake, except each tier has its own menu.

I represented the menu as a dictionary, which is the same shape the app still uses today:

```python
{"main": [...], "side": [...], "drink": [...]}
```

**Then reality kicked in.** Maths assumes perfect customers, but real people:

- don't always want 3 items. Sometimes it's just a main and a drink.
- have budgets.
- care about **ratings** (how good the food is) and **popularity** (how often it's bought).
- don't want the same meal every day.

**Decisions made:**

- Use **Kenyan food** priced in **KES**: Ugali, Pilau, Sukuma Wiki, Chai, Dawa.
- Allow **2-item combos**, so a great 2-item meal can beat a poor 3-item one.
- Add a **history filter**, so it doesn't repeat yesterday's meal.
- Use **z-scores** with NumPy to combine rating and popularity. These make the app ready for machine learning on Day 51.

---

## Day 36: Planning the building blocks

**What happened:** before writing the app, I decided on the tools:

| Tool | Job | Simple description |
|---|---|---|
| Python + NumPy | The brain | Does the maths and picks combos |
| FastAPI + SQLite | The engine and filing cabinet | Answers requests and stores data |
| JavaScript (React) | The face | Updates the screen without reloading |

**Why plan first:** splitting the app into layers means each part can be built and tested on its own, one day at a time.

---

## Day 37: The skeleton (React)

**What I built:** the layout of the app, using React for the first time.

**Why React?** A page can be split into small, reusable pieces called **components**. When data changes (like your budget), React updates only the parts of the screen that need it.

**Why mock data?** The Python brain didn't exist yet, so I used a temporary copy of the menu in JavaScript. This let me build the face first. That temporary code was deleted on Day 39.

**Prices:** my first prices were too high. I changed them to match a real local kibanda, where a full meal costs KES 150–290.

### The files (in `frontend/src/`)

Each component taught me one React idea:

| File | What it shows | React idea learned |
|---|---|---|
| `main.jsx` | Starts the app and puts it on the page | Entry point |
| `components/Header.jsx` | The app title | A component is just a function that returns UI |
| `components/MenuItemCard.jsx` | One dish: name, price, rating, "Ate yesterday" button | **Props**: data passed from parent to child |
| `components/MenuSection.jsx` | A list of dishes (Mains, Sides or Drinks) | **Lists**: `.map()` turns an array into cards, and each card needs a `key` |
| `components/BudgetForm.jsx` | The budget input box | **Controlled input**: the box shows the value its parent gives it |
| `components/RecommendationPanel.jsx` | The "Top picks" list | **Conditional rendering**: a message when nothing fits, a list when something does |
| `App.jsx` | Holds everything together | **useState**: the app's memory (budget and history) |
| `index.css` | Colours and layout | Two columns on a laptop, one column on a phone |

**The most important idea: lifting state up.** The budget lives in `App.jsx`, not in the input box. `App` passes it down to the input *and* to the recommendations, so both always agree.

```
App (holds budget + history)
├── BudgetForm          ← shows budget, reports changes back up
├── RecommendationPanel ← shows picks for that budget
└── MenuSection ×3
    └── MenuItemCard    ← "Ate yesterday" reports back up
```

---

## Day 38: The brain (Python)

**What I built:** the recommendation engine, the part that actually decides.

**Why Python?** It's where NumPy lives, and later it's where machine learning models live. Keeping the brain in Python means a real ML model can replace it on Day 51 without touching the React app.

### The files (in `backend/`)

**`menu.py`**: the menu as a Python dictionary (10 dishes). Today it's only used as starting data for the database (see Day 40).

**`engine.py`**: the brain. It works in 4 steps:

#### Step 1: Score every dish (`score_items`)

**The problem:** ratings are out of 5, but purchases can be 200. You can't add 4.8 + 150, because the bigger number would always win.

**The fix: z-scores.** A z-score asks: *how far above or below average is this dish?*

```
z = (value − average) ÷ standard deviation
```

**Worked example (Pilau):**

| | Pilau | Average of all dishes | Spread (std) | z-score |
|---|---|---|---|---|
| Rating | 4.8 | 4.33 | 0.32 | **+1.49** |
| Purchases | 150 | 106 | 45.7 | **+0.96** |

Now both are on the same scale, and Pilau is above average on both. They're combined like this:

```
score = 0.6 × rating z + 0.4 × popularity z
      = 0.6 × 1.49 + 0.4 × 0.96
      = +1.28   ← the highest-scoring dish on the menu
```

The 60/40 split means rating counts a bit more than popularity. You can change it with `RATING_WEIGHT` and `POPULARITY_WEIGHT`.

#### Step 2: Build every combo (`build_combos`)

This is the Cartesian product from Day 35. It uses three combo shapes (every combo includes a main):

| Shape | Count |
|---|---|
| main + side + drink | 4 × 3 × 3 = 36 |
| main + side | 4 × 3 = 12 |
| main + drink | 4 × 3 = 12 |
| **Total** | **60 combos** |

#### Step 3: Filter (`recommend`)

It throws away any combo that:

- costs more than the budget, or
- contains something you ate yesterday (the history).

#### Step 4: Rank (`recommend`)

Each combo's score is the **average** of its dishes' scores, and the top 3 are returned.

**Why the average and not the total?** With a total, 3 items would always beat 2. With an average, a strong 2-item combo can beat a weak 3-item one. That's exactly the Day 35 goal.

**Real results:**

- KES 300 → **Pilau + Chai** (KES 200)
- KES 150 → **Chapati & Beans + Chai** beats Githeri + Kachumbari + Chai
- Ate Pilau yesterday → it moves on to **Ugali & Beef Stew + Chai**

**A bug I hit:** the ★ symbol crashed the Windows terminal, which can't print it. I swapped it for the word "rating".

---

## Day 39: Connecting the face to the brain (FastAPI)

**What I built:** a way for React to ask Python questions.

**Why?** React runs in the browser and Python runs on the computer. They need a common language, and that's an **API**: a set of web addresses that return data.

### The files

**`backend/app.py`**: the FastAPI app (the waiter). It has two endpoints (web addresses):

| Address | What you get back |
|---|---|
| `GET /api/menu` | The full menu |
| `GET /api/recommend?budget=150&history=pilau` | The top combos for that budget |

FastAPI checks the inputs for you. For example, a negative budget is rejected automatically. It also builds a test page at `/docs` for free.

**`frontend/vite.config.js`**: a **proxy**. When React asks for `/api/...`, Vite forwards the request to Python on port 8000. That way the browser thinks everything comes from one place, which avoids a common browser blocking problem called CORS.

**`frontend/src/App.jsx`**: now uses **useEffect**, the new React idea for this day.

- `useState` = the app's memory
- `useEffect` = "after you draw the screen, go do something outside", like fetching data

```
Effect 1: when the app loads         → fetch the menu
Effect 2: when budget/history change → fetch new picks
```

It also has a **cleanup** step. If you type fast, older requests might arrive late, and cleanup makes sure an old answer never overwrites a new one.

**Deleted:** the temporary JavaScript menu and recommender from Day 37. Now the menu and the logic live in **one place only** (Python), so the two copies can't disagree.

---

## Day 40: Giving the app a memory (SQLite)

**What I built:** a real database and an **Order** button.

**Why a database?** A Python dictionary forgets everything when the server stops. A database keeps it. And for machine learning, **the order history is the training data**.

**Why SQLite?** It's built into Python (nothing to install), and it's just one file: `meals.db`.

### The files (in `backend/`)

**`setup_db.py`**: run once. It creates the database and copies the menu in. Running it again resets everything.

The database has 3 tables:

```
items         → the menu: id, name, slot, price, rating, purchases
orders        → one row per order, with the time it was placed
order_items   → which dishes were in each order
```

Why two tables for orders? One order can have many dishes, so `order_items` links them:

```
orders:       id=1, 2026-10-01 12:30
order_items:  (1, githeri), (1, kachumbari), (1, chai)
```

**`db.py`**: talks to the database, so the rest of the app doesn't have to write SQL.

- `load_menu()` reads every dish and groups it back into `{"main": [...], "side": [...], "drink": [...]}`. That's the same shape as before, so `engine.py` didn't need to change at all.
- `record_order()` saves the order and adds 1 to each dish's purchase count. It rejects dishes that aren't on the menu.

**`app.py`**: now reads the menu from the database, and has a new endpoint:

| Address | What it does |
|---|---|
| `POST /api/orders` with `{"item_ids": ["pilau", "chai"]}` | Saves an order |

**`.gitignore`**: keeps `meals.db` out of Git. Anyone can rebuild it with `setup_db.py`.

### The frontend changes

- `RecommendationPanel.jsx` has an **Order** button on each top pick.
- `App.jsx` has a `placeOrder()` function that **sends** data with a `POST` request (before, the app only *read* data). After ordering, it fetches the menu and the picks again so the new numbers show.

**Test result:** I ordered Githeri + Kachumbari + Chai 15 times, and its score rose from **+0.03 to +0.11**. The app learns from orders.

---

## What happens when you click "Order"

Following one click through the whole app:

1. You tap **Order** on "Pilau + Chai" in `RecommendationPanel.jsx`.
2. `placeOrder()` in `App.jsx` sends `{"item_ids": ["pilau", "chai"]}` to `/api/orders`.
3. Vite's proxy forwards it to FastAPI on port 8000.
4. `create_order()` in `app.py` checks the data and calls `record_order()`.
5. `db.py` saves the order to `meals.db` and adds 1 to Pilau's and Chai's purchases.
6. React gets "OK", shows 🎉, and increases `ordersPlaced`.
7. Because `ordersPlaced` changed, both `useEffect`s run again and fetch the fresh menu and picks.
8. `engine.py` recalculates the z-scores with the new purchase numbers, and the screen updates.

---

## File map

```
meal-combo-app/
├── THOUGHT_PROCESS.md          ← this document
├── backend/                    (Python)
│   ├── app.py                  FastAPI endpoints (the waiter)
│   ├── engine.py               Scoring + combos (the brain)
│   ├── db.py                   Reading and writing the database
│   ├── setup_db.py             Creates meals.db (run once)
│   ├── menu.py                 Starting menu data
│   ├── requirements.txt        numpy, fastapi, uvicorn
│   └── .gitignore              Keeps meals.db out of Git
└── frontend/                   (React)
    ├── vite.config.js          Proxy: /api → Python
    ├── index.html              The page React draws into
    └── src/
        ├── main.jsx            Starts React
        ├── App.jsx             State, fetching, ordering
        ├── index.css           Styling
        └── components/
            ├── Header.jsx
            ├── BudgetForm.jsx
            ├── MenuSection.jsx
            ├── MenuItemCard.jsx
            └── RecommendationPanel.jsx
```

## How to run it

```
# Terminal 1: the backend
cd backend
python setup_db.py                     # first time only
python -m uvicorn app:app --reload

# Terminal 2: the frontend
cd frontend
npm run dev                            # then open http://localhost:5173
```

---

## Things I'd still like to improve

- **2-item combos win a lot.** Averaging means adding a weaker third dish lowers the score. A small bonus for full meals could balance this.
- **"Ate yesterday" is forgotten on refresh.** It only lives in React's memory. It could come from the orders table instead.
- **Chai ranks very high** just because it has 200 purchases. Trying different weights would show how much popularity should count.

## What's next: Day 51 (machine learning)

Right now the scores come from a fixed formula (60% rating, 40% popularity). Once Phase 3 starts, the order history in `orders` and `order_items` can train a real model to predict what someone will like. Because the brain is separate from everything else, only `engine.py` needs to change. React, FastAPI and the database stay the same.

---

## Mini glossary

| Word | Simple meaning |
|---|---|
| **Variation** | An arrangement where order matters |
| **Cartesian product** | Every way to pick one item from each list |
| **Z-score** | How far above or below average something is, so different scales can be compared |
| **Component** | A reusable piece of the screen (React) |
| **Props** | Data a parent component passes to a child |
| **State / useState** | The app's memory; changing it redraws the screen |
| **useEffect** | Run something *after* drawing, like fetching data |
| **API / endpoint** | A web address that returns data instead of a page |
| **GET / POST** | GET = read data; POST = send data |
| **Proxy** | A middleman that forwards requests |
| **Database / table** | Organised storage, like a spreadsheet that remembers |
| **Seed data** | The starting data put into a new database |
