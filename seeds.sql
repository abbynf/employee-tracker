INSERT INTO department (name) VALUES ("customer service"), ("accounting"), ("sales");

INSERT INTO role (title, salary, department_id) VALUES ("head salesman", 23000, 3), ("customer service agent", 15000, 1), ("head accountant", 29000, 2), ("department head", 35000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("courtney", "smith", 2, 4), ("harry", "smyyth", 1, 4), ("henry", "adams", 3, 4), ("david", "hammerschmidt", 4, null);