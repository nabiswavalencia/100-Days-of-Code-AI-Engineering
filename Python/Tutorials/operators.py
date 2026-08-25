#arithmetic

15 + 23

26 - 50

20 / 4

22/7

# Comparison >, <, ==
#results are boolean values True or False
age1 = 22
age2 = 28
age1 > age2
age1 < age2
age1 == age2
print(age1 >= 18)   
print(age2 <= 18)

#logical operators
#and, or, not

age = 25
has_license = True

# AND - both must be true
can_drive = age >= 16 and has_license
print(can_drive)  # True

# OR - at least one must be true
day = "Saturday"
is_weekend = day == "Saturday" or day == "Sunday"
print(is_weekend)  # True

# NOT - reverses the value
is_adult = age >= 18
is_child = not is_adult
print(is_child)  # False

# = assigns a value
age = 18

# == compares values
if age == 18:
    print("Just turned adult!")