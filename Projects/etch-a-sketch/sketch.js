const GRID_TOTAL_SIZE = 960; // px, total width/height of the sketch pad
const DEFAULT_SIDE = 16;
const MAX_SIDE = 100;

const container = document.querySelector("#container");
const newGridBtn = document.querySelector("#new-grid-btn");

function randomRGB() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function handleHover(e) {
    const square = e.target;
    let hits = Number(square.dataset.hits) || 0;

    if (hits === 0) {
        square.style.backgroundColor = randomRGB();
    }

    hits += 1;
    square.dataset.hits = hits;

    // Darken by 10% per hit, fully opaque (black-out) after 10 hits.
    square.style.opacity = Math.min(hits * 0.1, 1);
}

function createGrid(squaresPerSide) {
    container.innerHTML = "";

    const squareSize = GRID_TOTAL_SIZE / squaresPerSide;

    for (let i = 0; i < squaresPerSide * squaresPerSide; i++) {
        const square = document.createElement("div");
        square.classList.add("grid-square");
        square.style.width = `${squareSize}px`;
        square.style.height = `${squareSize}px`;
        square.dataset.hits = 0;
        square.addEventListener("mouseover", handleHover);
        container.appendChild(square);
    }
}

function promptNewGrid() {
    const input = prompt(
        `Number of squares per side (max ${MAX_SIDE}):`,
        DEFAULT_SIDE
    );

    if (input === null) return; // user cancelled

    const size = Math.floor(Number(input));

    if (!Number.isInteger(size) || size <= 0) {
        alert("Please enter a valid positive number.");
        return;
    }

    if (size > MAX_SIDE) {
        alert(`Please enter a number no greater than ${MAX_SIDE}.`);
        return;
    }

    createGrid(size);
}

newGridBtn.addEventListener("click", promptNewGrid);

createGrid(DEFAULT_SIDE);
