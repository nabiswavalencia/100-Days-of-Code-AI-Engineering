// Full explanations for each section live as notes in forms-advanced-css.html.

const form = document.querySelector("#signup-form");
const output = document.querySelector("#form-output");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // checkValidity() runs every built-in constraint (required, pattern,
  // minlength/maxlength, min/max...) and returns a single true/false.
  if (!form.checkValidity()) {
    // reportValidity() asks the browser to show its native error bubbles,
    // even though the form has novalidate (which only suppresses submit-time validation).
    form.reportValidity();
    output.textContent = "Please fix the highlighted fields.";
    return;
  }

  // FormData reads every named field in one pass - no need to
  // manually grab each input by id.
  const data = new FormData(form);
  const entries = Object.fromEntries(data.entries());
  console.log(entries);

  output.textContent = `Welcome, ${entries.username}! Account created.`;
  form.reset();
});

// Custom validity: enforce a rule the built-in attributes can't express,
// here that the password isn't allowed to contain the username.
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");

function checkPasswordAgainstUsername() {
  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value.toLowerCase();

  if (username && password.includes(username)) {
    passwordInput.setCustomValidity("Password can't contain your username.");
  } else {
    // Must be cleared explicitly, or the field stays invalid forever.
    passwordInput.setCustomValidity("");
  }
}

usernameInput.addEventListener("input", checkPasswordAgainstUsername);
passwordInput.addEventListener("input", checkPasswordAgainstUsername);

// Range input: reflect the live value next to the slider.
const volumeInput = document.querySelector("#volume");
volumeInput.addEventListener("input", (e) => {
  volumeInput.setAttribute("aria-valuetext", `${e.target.value}%`);
});
