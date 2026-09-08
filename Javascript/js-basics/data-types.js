let myVariable;
myVariable = "Hello, World!";

//eight data types in JavaScript.
// 1. String
let myStringType = "This is a string";

// STRINGS

'This is a string'
"This is also a string"
let myString = 'This is a string value stored in a variable';

let myFirstName = "John";
let myLastName = "Doe";
let myFullName = myFirstName + " " + myLastName;

// String methods
let myStringLength = myFullName.length;
let myUpperCase = myFullName.toUpperCase();
let myLowerCase = myFullName.toLowerCase();
let mySubstring = myFullName.substring(0, 4); // "John"


// 2. Number
let myNumberType = 42;

// 3. Boolean
let myBooleanType = true;

// 4. Null
let myNullType = null;

// 5. Undefined
let myUndefinedType;  // variable declared but not assigned a value, hence undefined

// 6. Object (the only non primitive data type)
let myObjectType = { key: "value" };
const obj = { a: 3 };
obj.a = 5;  // allowed

// obj = { b: 5 } // not allowed
// 7. Symbol
let mySymbolType = Symbol("uniqueIdentifier");

// 8. BigInt
let myBigIntType = 1234567890123456789012345678901234567890n; // BigInt literal with 'n' at the end


// typeof operator

typeof undefined // "undefined"

typeof 0 // "number"

typeof 10n // "bigint"

typeof true // "boolean"

typeof "foo" // "string"

typeof Symbol("id") // "symbol"

typeof Math // "object"  (1)

typeof null // "object"  (2)

typeof alert // "function"  (3)

//difference between single, double, and backtick quotes.

let singleQuoteString = 'This is a string with single quotes';
let doubleQuoteString = "This is a string with double quotes";
let backtickString = `This is a string with backticks, which allows for string interpolation like this: ${myNumberType + 10}`; // using backticks for string interpolation



// ARITHMETIC OPERATORS
// Arithmetic operators allow you to perform mathematical calculations in JavaScript.

let addition = 5 + 3; // 8
let subtraction = 10 - 4; // 6
let multiplication = 7 * 2; // 14
let division = 20 / 5; // 4
let modulus = 10 % 3; // 1 (calculates the remainder of division)


//Logical Operators
// Logical operators are used to combine or negate boolean values in JavaScript.

let isAdult = true;
let hasPermission = false;

let canEnter = isAdult && hasPermission; // false (both conditions must be true)
let canAccess = isAdult || hasPermission;


//Comparison Operators
// Comparison operators are used to compare values in JavaScript.
let x = 10;
let y = 20;

let isEqual = x == y; // false (checks for equality)
let isNotEqual = x != y; // true (checks for inequality)
let isGreater = x > y; // false (checks if x is greater than y)
let isLess = x < y; // true (checks if x is less than y)



//CONDITIONAL STATEMENTS
// Conditional statements allow you to execute different blocks of code based on certain conditions.

if (x > y) {
    console.log("x is greater than y");
}

// Grading system using if-else statements

if (x >= 90) {
    console.log("Grade: A");
} else if (x >= 80) {
    console.log("Grade: B");
} else if (x >= 70) {
    console.log("Grade: C");
} else if (x >= 60) {
    console.log("Grade: D");
} else {
    console.log("Grade: F");
}

// nesting if statements
if (x > 0) {
    if (x < 10) {
        console.log("x is a positive single-digit number");
    } else {
        console.log("x is a positive number with multiple digits");
    }
}


// truthuy and falsy values
// In JavaScript, truthy and falsy values are used in conditional statements to determine the flow of execution.

let truthyValue = "Hello"; // non-empty string is truthy
let falsyValue = 0; // zero is falsy

if (truthyValue) {
    console.log("This value is truthy");
}
else {
    console.log("This value is falsy");
}



// Assignment

// Create a personal information manager that demonstrates all the JavaScript data types you've learned in this lesson while handling real-world data scenarios.

let personalInfo = {
    name: "Valencia Neema",
    age: 25,
    isStudent: true,
    favoriteColor: "blue",
    hobbies: ["reading", "traveling", "coding"],
}

// change details
personalInfo.age = 26; // updating age
personalInfo.hobbies.push("photography"); // adding a new hobby

// using backtick quotes for string interpolation
let introduction = `Hello, my name is ${personalInfo.name}. I am ${personalInfo.age} years old. My favorite color is ${personalInfo.favoriteColor}, and I enjoy ${personalInfo.hobbies.join(", ")}.`;

console.log(introduction);


// Embed a variable/expression in a string.
let message = `The sum of 5 and 3 is ${5 + 3}.`;
console.log(message);

