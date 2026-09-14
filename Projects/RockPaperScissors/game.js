// Grab the elements we need to read from / write to
const choiceButtons = document.querySelectorAll(".choice-btn");
const humanScoreEl = document.querySelector("#human-score");
const computerScoreEl = document.querySelector("#computer-score");
const resultEl = document.querySelector("#result");
const logEl = document.querySelector("#log");
const resetBtn = document.querySelector("#reset-btn");

const WINNING_SCORE = 5;
const EMOJI = { rock: "🪨", paper: "📄", scissors: "✂️" };

let humanScore = 0;
let computerScore = 0;

function getComputerChoice() {
  const choices = ["rock", "paper", "scissors"];
  return choices[Math.floor(Math.random() * choices.length)];

  //math.random returns a number greater than or equal to 0, but strictly less than 1

  //math.floor returns a rounded number to the lowest integer eg 1.6 and 1.2 both become 1

  //multiplying result of math.random with an integer like choices.length which is 3 gives us a value that can even be greater than 1 eg 0.8 * 3 = 2.4, so if we floor in this result of multiplication, we get an integer between 0 and less than 3, which is an accurate index. 
}

// Returns "win", "lose" or "tie" from the human's point of view
function getOutcome(human, computer) {
  if (human === computer) return "tie";

  const beats = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  };
  return beats[human] === computer ? "win" : "lose";
}

function addLogEntry(text) {
  const li = document.createElement("li");
  li.textContent = text;
  logEl.prepend(li);
}

function renderResult(outcome, human, computer) {
  const messages = {
    win: `You win! ${human} beats ${computer}`,
    lose: `You lose! ${computer} beats ${human}`,
    tie: `Tie! You both picked ${human}`,
  };

  resultEl.innerHTML = `
                <p class="headline ${outcome}">${EMOJI[human]} vs ${EMOJI[computer]}</p>
                <p class="detail">${messages[outcome]}</p>
            `;
}

function endGame() {
  const playerWon = humanScore > computerScore;
  resultEl.innerHTML = `
                <p class="headline ${playerWon ? "win" : "lose"}">
                    ${playerWon ? "🎉 You won the game!" : "💻 The computer won the game."}
                </p>
                <p class="detail">Final score ${humanScore} – ${computerScore}</p>
            `;
  choiceButtons.forEach((btn) => (btn.disabled = true));
  resetBtn.hidden = false;
}

function playRound(humanChoice) {
  const computerChoice = getComputerChoice();
  const outcome = getOutcome(humanChoice, computerChoice);

  if (outcome === "win") humanScore++;
  if (outcome === "lose") computerScore++;

  humanScoreEl.textContent = humanScore;
  computerScoreEl.textContent = computerScore;

  renderResult(outcome, humanChoice, computerChoice);
  addLogEntry(
    `${EMOJI[humanChoice]} ${humanChoice} vs ${EMOJI[computerChoice]} ${computerChoice} — ${outcome}`,
  );

  if (humanScore === WINNING_SCORE || computerScore === WINNING_SCORE) {
    endGame();
  }
}

function resetGame() {
  humanScore = 0;
  computerScore = 0;
  humanScoreEl.textContent = "0";
  computerScoreEl.textContent = "0";
  logEl.innerHTML = "";
  resultEl.innerHTML = `<p class="headline">Pick a move to start</p>`;
  choiceButtons.forEach((btn) => (btn.disabled = false));
  resetBtn.hidden = true;
}

// Attach one listener per choice button
choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    playRound(button.dataset.choice);
  });
});

resetBtn.addEventListener("click", resetGame);
