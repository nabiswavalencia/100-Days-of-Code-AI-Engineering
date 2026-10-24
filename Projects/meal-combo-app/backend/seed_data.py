# Seed data for meals.db. All restaurants and people here are fictional.
# setup_db.py copies this into the database. After that the app reads from the
# database, so editing this file only takes effect after running setup_db.py again.
#
# Item ids are prefixed with the restaurant's short code (mw-, kh-, br-, mt-) so they
# are unique across the whole app. `image` is a file in frontend/public/images
# (photo credits in CREDITS.md).


def item(id, name, price, rating, purchases, image=True):
    return {
        "id": id,
        "name": name,
        "price": price,
        "rating": rating,
        "purchases": purchases,
        "image": f"{id}.webp" if image else None,
    }


RESTAURANTS = [
    {
        "id": "mama-wanjiku",
        "name": "Mama Wanjiku’s Kibanda",
        "kind": "Local kibanda",
        "area": "Kenyatta Market, Nairobi",
        "tagline": "Home-style ugali, pilau and chai, cooked fresh every morning since 2009.",
        "quote": "If you leave my kibanda hungry, the next plate is on me.",
        "quote_by": "Mama Wanjiku, owner",
        "hero_image": "hero-mama-wanjiku.webp",
        "presets": [150, 200, 300],
        "default_budget": 300,
        "menu": {
            # The same menu as the original app, so the engine results stay comparable.
            "main": [
                item("mw-ugali-beef", "Ugali & Beef Stew", 180, 4.6, 120),
                item("mw-pilau", "Pilau", 170, 4.8, 150),
                item("mw-chapati-beans", "Chapati & Beans", 110, 4.2, 90),
                item("mw-githeri", "Githeri", 90, 3.9, 60),
            ],
            "side": [
                item("mw-sukuma", "Sukuma Wiki", 40, 4.3, 140),
                item("mw-kachumbari", "Kachumbari", 30, 4.5, 110),
                item("mw-cabbage", "Fried Cabbage", 40, 3.8, 40),
            ],
            "drink": [
                item("mw-dawa", "Dawa", 70, 4.7, 80),
                item("mw-chai", "Chai", 30, 4.4, 200),
                item("mw-passion", "Passion Juice", 50, 4.1, 70),
            ],
        },
        "specials": [
            {"item_id": "mw-pilau", "price": 150, "note": "Pilau Friday, until 3pm"},
            {"item_id": "mw-githeri", "price": None, "note": "Fresh pot at noon"},
        ],
    },
    {
        "id": "kahawa-house",
        "name": "Kahawa House",
        "kind": "Café",
        "area": "Kilimani, Nairobi",
        "tagline": "Single-origin Kenyan coffee, warm mandazi and a quiet table to work from.",
        "quote": "Every cup starts with beans from one farm in Nyeri.",
        "quote_by": "Otieno Were, head barista",
        "hero_image": "kh-latte.webp",
        "presets": [400, 600, 900],
        "default_budget": 600,
        "menu": {
            "main": [
                item("kh-wrap", "Chicken & Avocado Wrap", 550, 4.5, 95),
                item("kh-samosa", "Beef Samosa Platter", 380, 4.2, 70),
                item("kh-avocado-toast", "Avocado Toast", 450, 4.4, 85),
                item("kh-mandazi-plate", "Mandazi Breakfast Plate", 320, 4.6, 110),
            ],
            "side": [
                item("kh-chips", "Masala Chips", 250, 4.3, 120),
                item("kh-fruit", "Fruit Bowl", 280, 4.1, 60),
                item("kh-mandazi", "Two Mandazi", 120, 4.7, 140),
            ],
            "drink": [
                item("kh-latte", "Kenyan AA Latte", 330, 4.8, 210),
                item("kh-dawa-tea", "Ginger Lemon Tea", 280, 4.5, 90),
                item("kh-iced-hibiscus", "Iced Hibiscus", 300, 4.0, 55),
            ],
        },
        "specials": [
            {"item_id": "kh-latte", "price": 280, "note": "Morning latte, before 10am"},
            {"item_id": "kh-mandazi-plate", "price": None, "note": "New on the menu"},
            {"item_id": "kh-wrap", "price": 490, "note": "Lunch deal, weekdays"},
        ],
    },
    {
        "id": "baobab-room",
        "name": "The Baobab Room",
        "kind": "Fine dining",
        "area": "Karen, Nairobi",
        "tagline": "Coastal Swahili cooking and slow-roasted nyama choma, served under the old baobab.",
        "quote": "We cook the coast the way our grandmothers did, just slower.",
        "quote_by": "Chef Amina Said",
        "hero_image": "hero-baobab-room.webp",
        "presets": [2000, 3500, 5000],
        "default_budget": 3500,
        "menu": {
            "main": [
                item("br-fish-curry", "Swahili Fish Curry", 1850, 4.8, 64),
                item("br-nyama-choma", "Nyama Choma Platter", 2200, 4.6, 88),
                item("br-prawns", "Coconut Prawns", 2600, 4.7, 41),
                item("br-kienyeji", "Kienyeji Chicken & Ugali", 1650, 4.5, 72),
            ],
            "side": [
                item("br-kachumbari", "Kachumbari Salad", 450, 4.4, 90),
                item("br-mukimo", "Mukimo", 550, 4.3, 58),
                item("br-coconut-rice", "Coconut Rice", 480, 4.6, 77),
            ],
            "drink": [
                item("br-spritz", "Tamarind Spritz", 650, 4.5, 44),
                item("br-mojito", "Passion Mojito (alcohol-free)", 600, 4.3, 52),
                item("br-tea", "Kenyan Tea Service", 450, 4.7, 70),
            ],
        },
        "specials": [
            {"item_id": "br-prawns", "price": 2300, "note": "Chef's table, this week"},
            {"item_id": "br-fish-curry", "price": None, "note": "Today's catch from Malindi"},
        ],
    },
    {
        "id": "moto",
        "name": "Moto Pizza & Chicken",
        "kind": "Fast food",
        "area": "South B, Nairobi",
        "tagline": "Crispy chicken, stone-baked pizza and masala chips, ready in 15 minutes.",
        "quote": "Hot food, fast, and enough for the whole family.",
        "quote_by": "Kevin Mutua, manager",
        "hero_image": "mt-burger.webp",
        "presets": [600, 1000, 1500],
        "default_budget": 1000,
        "menu": {
            "main": [
                item("mt-veggie", "Veggie Supreme Pizza", 1100, 4.4, 160),
                item("mt-chicken", "Two-Piece Fried Chicken", 550, 4.5, 210),
                item("mt-tikka-pizza", "Chicken Tikka Pizza", 1300, 4.6, 120),
                item("mt-burger", "Beef Burger", 650, 4.1, 95),
            ],
            "side": [
                item("mt-chips", "Masala Chips", 250, 4.6, 230),
                item("mt-coleslaw", "Coleslaw", 150, 3.9, 70),
                item("mt-wings", "Chicken Wings (4)", 450, 4.3, 110),
            ],
            "drink": [
                item("mt-soda", "Soda 500ml", 120, 4.0, 250),
                item("mt-mango", "Fresh Mango Juice", 200, 4.4, 90),
                item("mt-milkshake", "Milkshake", 350, 4.2, 80),
            ],
        },
        "specials": [
            {"item_id": "mt-chicken", "price": 450, "note": "Tuesday chicken deal"},
            {"item_id": "mt-tikka-pizza", "price": 1150, "note": "Family night, after 6pm"},
            {"item_id": "mt-milkshake", "price": None, "note": "New flavour: chocolate"},
        ],
    },
]

USERS = [
    {
        "id": "achieng",
        "name": "Achieng Otieno",
        "profile": "Student at UoN, eats on a tight budget",
    },
    {
        "id": "brian",
        "name": "Brian Kiprono",
        "profile": "Software engineer in Westlands",
    },
    {
        "id": "fatuma",
        "name": "Fatuma Hassan",
        "profile": "Parent of two in South B",
    },
]

# Past orders: (user, restaurant, days ago, hour of day, item ids).
# Dates are relative to when setup_db.py runs, so "yesterday" is always yesterday.
ORDERS = [
    ("achieng", "mama-wanjiku", 1, 13, ["mw-githeri", "mw-kachumbari", "mw-chai"]),
    ("achieng", "mama-wanjiku", 2, 13, ["mw-chapati-beans", "mw-chai"]),
    ("achieng", "mama-wanjiku", 4, 12, ["mw-pilau", "mw-chai"]),
    ("achieng", "moto", 6, 19, ["mt-chicken", "mt-soda"]),
    ("brian", "kahawa-house", 0, 8, ["kh-mandazi-plate", "kh-latte"]),
    ("brian", "kahawa-house", 1, 13, ["kh-wrap", "kh-latte"]),
    ("brian", "kahawa-house", 3, 9, ["kh-avocado-toast", "kh-dawa-tea"]),
    ("brian", "baobab-room", 5, 20, ["br-fish-curry", "br-coconut-rice", "br-spritz"]),
    ("fatuma", "moto", 1, 19, ["mt-tikka-pizza", "mt-chips", "mt-mango"]),
    ("fatuma", "moto", 1, 19, ["mt-chicken", "mt-chips", "mt-soda"]),
    ("fatuma", "moto", 8, 18, ["mt-veggie", "mt-coleslaw", "mt-soda"]),
    ("fatuma", "mama-wanjiku", 3, 12, ["mw-ugali-beef", "mw-sukuma", "mw-passion"]),
]
