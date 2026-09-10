// Write a program that takes a user’s input and prints the numbers from one to the number the user entered. However, for multiples of three print Fizz instead of the number and for the multiples of five print Buzz. For numbers which are multiples of both three and five print FizzBuzz.

// Planning

// When a user inputs a number
// Loop from 1 to the entered number
// If the current number is divisible by 3 then print "Fizz"
// If the current number is divisible by 5 then print "Buzz"
// If the current number is divisible by 3 and 5 then print "FizzBuzz"
// Otherwise print the current 

//Solving

//1. Get input from the user
let answer = parseInt(prompt("Please enter the number you would like to FizzBuzz up to: ")); //We wrapped the prompt call in a parseInt function so that a number is returned from the user’s input.

//2. Loop from 1 to the entered number

for (let i = 1; i <= answer; i++) {
  console.log(i);
} //Declare variable i and set it to 1. The loop will continue as long as i is less than or equal to the user’s input. After each iteration, increment i by 1.

//3. Check if the current number is divisible by 3 and 5

for (let i = 1; i <= answer; i++) {
  if (i % 3 === 0) {
    console.log("Fizz");
  } else {
    console.log(i);
  }
}

//4. Check if the current number is divisible by 5


for (let i = 1; i <= answer; i++) {
  if (i % 3 === 0) {
    console.log("Fizz");
  } else if (i % 5 === 0) {
    console.log("Buzz");
  } else {
    console.log(i);
  }
}


//5. Check if the current number is divisible by both 3 and 5
for (let i = 1; i <= answer; i++) {
  if (i % 3 === 0 && i % 5 === 0) {
    console.log("FizzBuzz");
    //With the condition if (i % 3 === 0 && i % 5 === 0) coming first, we check that i is divisible by both 3 and 5 before moving on to check if it is divisible by 3 or 5 individually in the else if conditions.
  } else if (i % 3 === 0) {
    console.log("Fizz");
  } else if (i % 5 === 0) {
    console.log("Buzz");
  } else {
    console.log(i);
  }
}


//putting it all together
let userAnswer = parseInt(prompt("Please enter the number you would like to FizzBuzz up to: "));

for (let i = 1; i <= userAnswer; i++) {
  if (i % 3 === 0 && i % 5 === 0) {
    console.log("FizzBuzz");
  } else if (i % 3 === 0) {
    console.log("Fizz");
  } else if (i % 5 === 0) {
    console.log("Buzz");
  } else {
    console.log(i);
  } 
}
