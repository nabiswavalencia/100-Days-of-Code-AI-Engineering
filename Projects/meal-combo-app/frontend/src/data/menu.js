// Mock menu data (Day 37). Each key is a "slot" and each value is the list
// of options for that slot, the same shape as the Python dictionary from Day 35.
// Later this will come from the FastAPI backend instead of being hard-coded.
export const menu = {
  main: [
    { id: "ugali-beef", name: "Ugali & Beef Stew", price: 180, rating: 4.6, purchases: 120 },
    { id: "pilau", name: "Pilau", price: 170, rating: 4.8, purchases: 150 },
    { id: "chapati-beans", name: "Chapati & Beans", price: 110, rating: 4.2, purchases: 90 },
    { id: "githeri", name: "Githeri", price: 90, rating: 3.9, purchases: 60 },
  ],
  side: [
    { id: "sukuma", name: "Sukuma Wiki", price: 40, rating: 4.3, purchases: 140 },
    { id: "kachumbari", name: "Kachumbari", price: 30, rating: 4.5, purchases: 110 },
    { id: "cabbage", name: "Fried Cabbage", price: 40, rating: 3.8, purchases: 40 },
  ],
  drink: [
    { id: "dawa", name: "Dawa", price: 70, rating: 4.7, purchases: 80 },
    { id: "chai", name: "Chai", price: 30, rating: 4.4, purchases: 200 },
    { id: "passion", name: "Passion Juice", price: 50, rating: 4.1, purchases: 70 },
  ],
};

// Labels for each slot, used as section headings in the UI.
export const slotLabels = {
  main: "Mains",
  side: "Sides",
  drink: "Drinks",
};
