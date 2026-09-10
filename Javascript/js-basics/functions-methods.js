// A function is a self-contained block of code that performs a specific task
// They allow the code to be called many times without repetition.


//FUNCTION DECLARATION
function nameOfFunction() { 
  alert('This function is called nameOfFunction!');
}

function displayGreeting() {
  console.log('Hello, world!');
}

// calling our function
displayGreeting();

//multiple parameters
function name(param, param2, param3) {
//  body of the function
}


function displayGreeting(name) {
  const message = `Hello, ${name}!`;
  console.log(message);
}

displayGreeting('Valencia'); // displays "Hello, Valencia!" when run

//LOCAL VARIABLES

// Variables declared inside a function are local to that function and cannot be accessed outside of it.
function calculateArea(length, width) {
  const area = length * width;
  return area;
}

function showMessage() {
  let message = "Hello, I'm JavaScript!"; // local variable

  alert( message );
}

// alert( message ); // <-- Error! The variable is local to the function


//OUTER/ GLOBAL VARIABLES

// Variables declared outside of a function are global and can be accessed from anywhere in the code.
let globalMessage = "Hello, I'm a global variable!"; // global variable

function showGlobalMessage() {
  alert( globalMessage ); // can access the global variable
}

showGlobalMessage(); // displays "Hello, I'm a global variable!" when run



let userName = "Valencia"; // global variable

function greetUser() {
  let greeting = `Hello, ${userName}!`; // can access the global variable
  console.log(greeting);
}
greetUser();
greetUser("Neema"); // displays "Hello, Neema!" when run


//If a same-named variable is declared inside the function then it shadows the outer one. For instance, in the code below the function uses the local userName. The outer one is ignored:

let age = 18

function checkAge() {
  let age = 21; // local variable shadows the outer one
  if (age >= 18) {
    console.log("You are an adult."); 
  }
  else {
    console.log("You are a minor.");
  }
}
  checkAge(); // displays "You are an adult." when run
  console.log(age); // displays 18 when run, because the outer variable is not affected by the inner one  





// DEFAULT PARAMETERS
function displayGreeting(name, salutation='Hello') {
  console.log(`${salutation}, ${name}`);
}

displayGreeting('Valencia'); // displays "Hello, Valencia!"
displayGreeting('Valencia', 'Hi'); // displays "Hi, Valencia!"

// RETURNING VALUES
function addNumbers(num1, num2) {
  return num1 + num2;
}

function createGreetingMessage(name) {
  const message = `Hello, ${name}`;
  return message;
}

const greetingMessage = createGreetingMessage('Valencia');
console.log(greetingMessage); // displays "Hello, Valencia!"


// Functions as parameters for functions
function displayDone() {
  console.log('3 seconds has elapsed');
}
// timer value is in milliseconds
setTimeout(displayDone, 3000);


//RETURNING A VALUE FROM A FUNCTION
function calculateArea(length, width) {
  const area = length * width;
  return area; // returns the calculated area
}

let myArea = calculateArea(5, 10); // calling the function and storing the returned value
console.log(myArea); // displays 50 when run  

const myText = "The weather is cold";
const newString = myText.replace("cold", "warm");
console.log(newString); // Should print "The weather is warm"
// the replace() string function takes a string,
// replaces one substring with another, and returns
// a new string with the replacement made

// FAT ARROW FUNCTIONS
const displayGreeting = (name) => {
  console.log(`Hello, ${name}!`);
}


// Function Expression vs Function Declaration

// Function Declaration
// Function Declaration: a function, declared as a separate statement, in the main code flow:
// A Function Declaration can be called earlier than it is defined.
function sum(a, b) {
  return a + b;
}

// Function Expression

// Function Expression: a function, created inside an expression or inside another syntax construct. Here, the function is created on the right side of the “assignment expression” =: 
// A Function Expression is created when the execution reaches it and is usable only from that moment.
let sum = function(a, b) {
  return a + b;
};

// ASSIGNMENT
// Create a utility library of mathematical functions that demonstrates different function concepts covered in this lesson, including parameters, default values, return values, and arrow functions.


const mathUtils = {
    add: (num1, num2) => num1 + num2,
    subtract: (num1, num2) => num1 - num2,
    multiply: (num1, num2) => num1 * num2,
    divide: (num1, num2) => {
        if (num2 === 0) {
            return 'Error: Division by zero is not allowed.';
        }
        return num1 / num2;
    },
    power: (base, exponent = 2) => Math.pow(base, exponent), // default exponent is 2
    squareRoot: (num) => {
        if (num < 0) {
            return 'Error: Square root of negative numbers is not defined.';
        }
        return Math.sqrt(num);
    }

}


//Write a function called add7 that takes one number and returns that number + 7. 

function add7(num) {
    return num + 7;
}

//Write a function called multiply that takes two numbers and returns their product.
function multiply(num1, num2) {
    return num1 * num2;
}

//Write a function called capitalize that takes a string and returns that string with only the first letter capitalized. Make sure that it can take strings that are lowercase, UPPERCASE or BoTh.
//capitalize("abcd") should return "Abcd"
// capitalize("ABCD") should return "Abcd"
// capitalize("aBcD") should return "Abcd"
function capitalize(str) {
    if (str.length === 0) { 
      return str; // return empty string if input is empty
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// // Write a function called lastLetter that takes a string and returns the very last letter of that string:

//     lastLetter("abcd") should return "d"

function lastLetter (str){

    if (str.length === 0) {
        return str; // return empty string if input is empty  
  } 

    return str.charAt(str.length - 1);
}