//ELEMENT CREATION
const div = document.createElement("div");

//Append elements

parentNode.appendChild(childNode)
parentNode.insertBefore(newNode, referenceNode)

//Remove elements
parentNode.removeChild(child)

//Adding inline style

// sets the indicated style rule to the element in the div variable
div.style.color = "blue";

// set the entire inline style
div.setAttribute("style", "color: blue; background: white;");


// dot notation with kebab case: doesn't work as it attempts to subtract color from div.style.background
// equivalent to: div.style.background - color
// div.style.background-color;


// dot notation with camelCase: works, accesses the div's background-color style
div.style.backgroundColor;

// bracket notation with kebab-case: also works
div.style["background-color"];

// bracket notation with camelCase: also works
div.style["backgroundColor"];


//Editing Attributes

// if id exists, update it to 'theDiv', else create an id with value "theDiv"
div.setAttribute("id", "theDiv");

// returns value of specified attribute, in this case "theDiv"
div.getAttribute("id");

// removes specified attribute
div.removeAttribute("id");


//Working with classes

// adds class "new" to your new div
div.classList.add("new");

// removes "new" class from div
div.classList.remove("new");

// if div doesn't have class "active" then add it, or if it does, then remove it
div.classList.toggle("active");


//Adding text content
// creates a text node containing "Hello World!" and inserts it in div
div.textContent = "Hello World!";

//Adding HTML content
// renders the HTML inside div
div.innerHTML = "<span>Hello World!</span>";

// Using textContent is preferred over innerHTML for adding text, as innerHTML should be used sparingly to avoid potential security risks.


//ALL TOGETHER

// <!-- your HTML file: -->
// <body>
//   <h1>THE TITLE OF YOUR WEBPAGE</h1>
//   <div id="container"></div>
// </body>

// your JavaScript file
const container = document.querySelector("#container");

const content = document.createElement("div");
content.classList.add("content");
content.textContent = "This is the glorious text-content!";

container.appendChild(content);

// <!-- The DOM -->
// <body>
//   <h1>THE TITLE OF YOUR WEBPAGE</h1>
//   <div id="container">
//     <div class="content">This is the glorious text-content!</div>
//   </div>
// </body>


//EXERCISE: add elements to the container using only JS and DOM methods

// a <p> with red text that says "Hey I'm red!"
const redPara = document.createElement("p");
redPara.textContent = "Hey I'm red!";
redPara.style.color = "red";
container.appendChild(redPara);

// an <h3> with blue text that says "I'm a blue h3!"
const blueH3 = document.createElement("h3");
blueH3.textContent = "I'm a blue h3!";
blueH3.style.color = "blue";
container.appendChild(blueH3);

// a <div> with a black border and pink background containing an <h1> and a <p>
const box = document.createElement("div");
box.style.border = "1px solid black";
box.style.backgroundColor = "pink";

const boxHeading = document.createElement("h1");
boxHeading.textContent = "I'm in a div";

const boxPara = document.createElement("p");
boxPara.textContent = "ME TOO!";

// append the children to the div before adding it to the container
box.appendChild(boxHeading);
box.appendChild(boxPara);
container.appendChild(box);


