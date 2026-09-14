// Full explanations for each section live as notes in dom-manipulation.html.

// Method 1 (inline onclick) needs no JS - it's set directly in the HTML.

// Method 2: on<eventType> property
const btnOnclick = document.querySelector("#btn-onclick");
btnOnclick.onclick = () => alert("Hello World");

// Method 3: addEventListener
const btnAddListener = document.querySelector("#btn-add-listener");
btnAddListener.addEventListener("click", () => {
  alert("Hello World");
});

// The event object
const btnEventObject = document.querySelector("#btn-event-object");
btnEventObject.addEventListener("click", function (e) {
  console.log(e.target);
  e.target.style.background = "blue";
  
});

// Named function as callback
function handleClick(e) {
  alert("Hello World");
}

const btnNamedCallback = document.querySelector("#btn-named-callback");
btnNamedCallback.addEventListener("click", handleClick);
// btnNamedCallback.removeEventListener("click", handleClick); // must be the SAME reference

// Attaching listeners to a group of nodes
const groupButtons = document.querySelectorAll("#button-group button");
groupButtons.forEach((button) => {
  button.addEventListener("click", () => {
    alert(button.id);
  });
});

// Event propagation: preventDefault stops the form from reloading the page
const demoForm = document.querySelector("#demo-form");
demoForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

// Event delegation: one listener on the parent handles clicks from any child button
const delegationContainer = document.querySelector("#delegation-container");
delegationContainer.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    alert(e.target.id);
  }
});
