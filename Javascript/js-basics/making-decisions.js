let myTrueBool = true;
let myFalseBool = false;

// Comparison Operators
// Comparison operators allow you to compare values and return a boolean result (true or false).

let isEqual = (5 == '5'); // true (loose equality, type coercion)
let isStrictEqual = (5 === '5'); // false (strict equality, no type coercion)
let isGreater = (10 > 5); // true
let isLess = (3 < 7); // true
let isGreaterOrEqual = (10 >= 5); // true

let isLessOrEqual = (3 <= 7); // true

// IF Statements
// IF statements allow you to execute a block of code based on a condition.

if (condition) {
  // Condition is true. Code in this block will run.
}

let currentMoney = 1000;
let laptopPrice = 800;

if (currentMoney >= laptopPrice) {
  // Condition is true. Code in this block will run.
  console.log("Getting a new laptop!");
}


// IF...ELSE Statements
// IF...ELSE statements allow you to execute one block of code if a condition is true, and another block of code if the condition is false.

if (condition) {
  // Condition is true. Code in this block will run.
} else {
  // Condition is false. Code in this block will run.
}

let drivingAge = 20;
let userAge = 18;

if (userAge >= drivingAge) {
    console.log("You are old enough to drive!");
} else {
    console.log("You are not old enough to drive.");
}

// SWITCH Statements
// SWITCH statements allow you to execute different blocks of code based on the value of a variable.

switch (expression) {
  case x:
    // code block
    break;
  case y:
    // code block
    break;
  default:
    // code block
}

let grade = 'B';

switch (grade) {
    case 'A':
        console.log("Excellent!");
        break;
    case 'B':
        console.log("Good job!");
        break;
    case 'C':
        console.log("You can do better.");
        break;
    default:
        console.log("Invalid grade.");
}


// Logical Operators and Boolean Logic
// Logical operators allow you to combine multiple conditions and return a boolean result.
let isRaining = true;
let isCold = false;

let shouldWearJacket = isRaining && isCold; // false (both conditions must be true)
let shouldGoOut = isRaining || isCold; // true (at least one condition must be true)
let shouldStayInside = !isRaining; // false (negation operator)

// Negation operator (!) inverts the boolean value of a condition. If the condition is true, it becomes false, and vice versa.

if (!condition) {
  // runs if condition is false
} else {
  // runs if condition is true
}


// TERNARY OPERATOR

let variable = condition ? returnThisIfTrue : returnThisIfFalse;

let firstNumber = 20;
let secondNumber = 10;
let biggestNumber = firstNumber > secondNumber ? firstNumber : secondNumber;


let biggestNumber2;
if (firstNumber > secondNumber) {
  biggestNumber2 = firstNumber;
} else {
  biggestNumber2 = secondNumber;
}


// ASSIGNMENT 

// Write a JavaScript program that takes a student's numerical score (0-100) and determines their letter grade using the following criteria:

// A: 90-100
// B: 80-89
// C: 70-79
// D: 60-69
// F: Below 60


let score = 85; // Example score
let letterGrade;

if (score >= 90) {
    letterGrade = 'A';
}
else if (score >= 80) {
    letterGrade = 'B';
}
else if (score >= 70) {
    letterGrade = 'C';
}
else if (score >= 60) {
    letterGrade = 'D';
}
else {
    letterGrade = 'F';
}