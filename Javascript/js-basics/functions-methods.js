// A function is a self-contained block of code that performs a specific task

function nameOfFunction() { // function definition
 // function definition/body
}

function displayGreeting() {
  console.log('Hello, world!');
}

// calling our function
displayGreeting();


function name(param, param2, param3) {

}

function displayGreeting(name) {
  const message = `Hello, ${name}!`;
  console.log(message);
}

displayGreeting('Valencia'); // displays "Hello, Valencia!" when run


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

// FAT ARROW FUNCTIONS
const displayGreeting = (name) => {
  console.log(`Hello, ${name}!`);
}


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