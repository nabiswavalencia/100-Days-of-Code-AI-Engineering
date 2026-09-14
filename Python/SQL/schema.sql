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

-- /* @datacloud.settings
-- {
--   "version": 1,
--   "service": "BIG_QUERY",
--   "connectionInfo": {
--     "billingProjectId": "INHERIT"
--   },
--   "dialect": "GOOGLE_SQL"
-- }
-- */

-- Simple employees table for practicing SQL fundamentals
-- (SELECT, FROM, WHERE, DISTINCT, ORDER BY, LIMIT, AND/OR/NOT, comparison operators)

-- CREATE SCHEMA IF NOT EXISTS `daysofcode-508608.practice`
-- OPTIONS(location = 'US');

-- The above option is an alternative of creating a schema, otherwise just work from console


CREATE TABLE `daysofcode-508608.practice.employees` (
    id INT64,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    email STRING NOT NULL,
    department STRING NOT NULL,
    salary INT64 NOT NULL,
    hire_date DATE NOT NULL
);