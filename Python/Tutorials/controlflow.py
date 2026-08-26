age = 18

if age >= 18:
    print("You can vote!")
    print("You're an adult")

temperature = 25

if temperature > 30:
    print("It's hot!")
else:
    print("Nice weather!")

score = 85

if score >= 90:
    print("A - Excellent!")
elif score >= 80:
    print("B - Good job!")
elif score >= 70:
    print("C - Keep it up!")
else:
    print("F - Need improvement")

age = 25
has_license = True

# Both must be True
if age >= 18 and has_license:
    print("You can drive!")

weekend = True
holiday = False
# At least one must be True

if weekend or holiday:
    print("No work today!")

if weekend and holiday:
    print("Double celebration!")

True and False 

raining = False
# Reverse the condition
if not raining:
    print("Let's go outside!")