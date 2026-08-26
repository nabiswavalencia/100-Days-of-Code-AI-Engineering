import random

def guessing_game():
    random_number = random.randint(0, 100)

    while True:
        user_choice = int(input("Guess a number between 0 and 100: "))

        if user_choice < random_number:
            print("Too low! Try again.")
        elif user_choice > random_number:
            print("Too high! Try again.")
        else:
            print("Congratulations! You guessed the number.")       

guessing_game()