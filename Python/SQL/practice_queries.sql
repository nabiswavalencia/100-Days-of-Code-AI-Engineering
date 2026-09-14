/* @datacloud.settings
{
  "version": 1,
  "service": "BIG_QUERY",
  "connectionInfo": {
    "billingProjectId": "INHERIT"
  },
  "dialect": "GOOGLE_SQL"
}
*/

-- SQL fundamentals practice, based on the employees table.
-- Write your own query under each numbered exercise.

-- 1. SELECT + FROM: get every column for every employee.
SELECT * FROM `daysofcode-508608.practice.employees` ;



-- USE EXTERNAL DATASET
SELECT city
        FROM `bigquery-public-data.openaq.global_air_quality`
        WHERE country = 'US';

-- 2. SELECT specific columns: first_name, last_name, and email only.
SELECT first_name, last_name, email FROM `daysofcode-508608.practice.employees`; 

-- 3. WHERE: employees in the "IT" department.
SELECT first_name, last_name, email 
FROM `daysofcode-508608.practice.employees`
WHERE department = "IT"; 


--group your data and count things within those groups

--COUNT: If you pass it the name of a column, it will return the number of entries in that column
-- Other examples of aggregate functions include SUM(), AVG(), MIN(), and MAX().

SELECT COUNT(first_name)
FROM `daysofcode-508608.practice.employees`;

--GROUP BY takes the name of one or more columns, and treats all rows with the same value in that column as a single group when you apply aggregate functions like COUNT()

SELECT first_name, COUNT(email)
FROM `daysofcode-508608.practice.employees`
GROUP BY first_name;


--GROUP BY ... HAVING¶

-- HAVING is used in combination with GROUP BY to ignore groups that don't meet certain criteria.



-- 4. Comparison operators: employees with a salary greater than 5000.


-- 5. AND: employees in "Sales" AND hired after 2020-01-01.


-- 6. OR: employees in "HR" OR "Marketing".


-- 7. NOT: employees NOT in the "IT" department.


-- 8. DISTINCT: list each department name once.


-- 9. ORDER BY: all employees sorted by salary, highest first.


-- 10. LIMIT: the 3 most recently hired employees.
