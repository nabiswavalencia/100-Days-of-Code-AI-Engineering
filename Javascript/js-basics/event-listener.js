//Method 1: specify function attributes directly on your HTML elements.

// <button onclick="alert('Hello World')">Click Me</button>

// Drawback: the JS logic lives inside the HTML, which gets messy fast.
// You can also only set one "onclick" handler per element this way.

//Method 2: set properties in the form of on<eventType>, such as onclick or onmousedown, on the DOM nodes in your JavaScript.

// <!-- the HTML file -->
// <button id="btn">Click Me</button>


// the JavaScript file
const btn = document.querySelector("#btn");
btn.onclick = () => alert("Hello World");

// Better: keeps JS and HTML separate.
// Drawback: still only one handler per event type, because assigning
// btn.onclick again overwrites the previous function.

//Method 3: attach event listeners to the DOM nodes in your JavaScript.
// This is the most flexible and preferred approach.

// <!-- the HTML file -->
// <button id="btn">Click Me Too</button>

const btn2 = document.querySelector("#btn");
btn2.addEventListener("click", () => {
  alert("Hello World");
});

// addEventListener(eventType, callback) lets you:
// - attach MULTIPLE listeners for the same event type
// - remove listeners later with removeEventListener()
// - listen for events that the on<event> properties don't expose


//THE EVENT OBJECT
// The callback receives an "event" object with useful info about what happened.

btn2.addEventListener("click", function (e) {
  // e.target is the DOM node that the event fired on
  console.log(e.target);

  // you can act on the element that was clicked
  e.target.style.background = "blue";
});


//NAMED FUNCTIONS AS CALLBACKS
// Callbacks can also be named functions, which keeps code cleaner
// and makes the listener removable.

function handleClick(e) {
  alert("Hello World");
}

btn2.addEventListener("click", handleClick);
// btn2.removeEventListener("click", handleClick); // must be the SAME reference


//ATTACHING LISTENERS TO GROUPS OF NODES
// querySelectorAll returns a NodeList. Loop over it to attach a listener to each.

// <div id="container">
//   <button id="1">Click Me</button>
//   <button id="2">Click Me</button>
//   <button id="3">Click Me</button>
// </div>

const buttons = document.querySelectorAll("button");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    alert(button.id);
  });
});


//USEFUL EVENT TYPES
// click        - mouse click / tap
// dblclick     - double click
// mouseover    - pointer enters an element
// mouseout     - pointer leaves an element
// keydown      - a key is pressed down
// keyup        - a key is released
// submit       - a form is submitted
// load         - resource (page, image) finished loading
// DOMContentLoaded - HTML is parsed, safe to query the DOM


//EVENT PROPAGATION: BUBBLING AND CAPTURING
// When an event fires on an element, it travels:
//   1. capturing phase: from the document down to the target
//   2. target phase: the element itself
//   3. bubbling phase: back up from the target to the document
// By default listeners run during the bubbling phase.

// e.stopPropagation()   - stops the event travelling further up/down
// e.preventDefault()    - cancels the browser's default action
//                         (e.g. stops a form from reloading the page)

const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault(); // handle the submit with JS instead of a page reload
});


//EVENT DELEGATION
// Instead of adding a listener to every child, add ONE listener to the parent
// and use e.target to figure out which child was interacted with.
// This also works for elements added to the DOM later.

const container = document.querySelector("#container");
container.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    alert(e.target.id);
  }
});
