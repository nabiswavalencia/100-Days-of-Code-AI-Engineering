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

-- Sample data for the employees table
-- Run schema.sql first, then this file

INSERT INTO `daysofcode-508608.practice.employees`(first_name, last_name, email, department, salary, hire_date) VALUES
('Amina',   'Otieno',  'amina.otieno@example.com',  'Sales',     4800, '2021-03-14'),
('Brian',   'Mwangi',  'brian.mwangi@example.com',  'IT',        6200, '2019-07-01'),
('Cynthia', 'Njoroge', 'cynthia.njoroge@example.com','Marketing', 5000, '2022-01-20'),
('David',   'Kiptoo',  'david.kiptoo@example.com',  'IT',        7100, '2018-11-05'),
('Esther',  'Wanjiru', 'esther.wanjiru@example.com','HR',        4500, '2020-06-30'),
('Felix',   'Omondi',  'felix.omondi@example.com',  'Sales',     5300, '2023-02-11'),
('Grace',   'Achieng', 'grace.achieng@example.com', 'Marketing', 4900, '2021-09-09'),
('Henry',   'Kamau',   'henry.kamau@example.com',   'IT',        6800, '2017-04-18'),
('Irene',   'Chebet',  'irene.chebet@example.com',  'HR',        4700, '2022-08-25'),
('James',   'Odhiambo','james.odhiambo@example.com','Sales',     5100, '2020-12-02');

