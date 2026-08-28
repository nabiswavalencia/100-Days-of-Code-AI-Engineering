#integers

age = 22
type(age)

#floats
amount = 10.00
type(amount)

#strings
first_name = "Valencia"
type(first_name)

last_name = "Neema"
type(last_name)

my_long_string = """This is a long string that spans multiple lines. \nThis prints on a new line."""

print(my_long_string)

long_dash = "_" * 20
print(first_name)
print(long_dash)
print(f"{first_name} {last_name}\n{long_dash}")

introduction = "My name is " + first_name + " " + last_name

type(introduction)

#string formating (F strings)
print(f"Hello everyone. My name is {first_name} and i am {age} years old. ")


#Booleans
is_student = True
type (is_student)

user_age = 18
child_age = 15


can_vote = user_age >= 18
cant_vote = child_age < 18
print(f"{user_age} Can vote: {can_vote}")
print(f"{child_age} Cannot vote: {cant_vote}")


#string methods
text = "100 days of code"
print(text.upper())
print(text.lower())
print(text.title())

introduction = "My name is Valencia Neema. I am a software engineer and a data scientist."

print(introduction.split())
print(introduction.split("."))
print( "Valencia" in introduction)
print("Python" not in introduction)
startswith = introduction.startswith("My name")
print(startswith)