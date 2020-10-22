const mysql = require('mysql');
var inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: "",
    database: "employee_db"
})

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected", connection.threadId);
})

function likeToDo() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to do?",
                choices: ["View employees", "View departments", "View roles", "Add an employee", "Add a department", "Add a role", "Update an employee", "Update a department", "Update a role", "Remove an employee", "Remove a role", "Remove a department"],
                name: "likeToDo"
            }
        ])
        .then(function (response) {
            console.log("you have chosen " + response.likeToDo);
            switch (response.likeToDo) {
                case "View employees":
                    viewEmployees();
                    break;
                case "View departments":
                    viewDepartments();
                    break;
                case "View roles":
                    console.log("You have chosen view roles");
                    break;
                case "Add an employee":
                    console.log("add ane mployee");
                    break;
                case "Add a department":
                    console.log("add a department")
                    break;
                case "Add a role":
                    console.log("Add a role");
                    break;
                case "Update an employee":
                    console.log("update employee");
                    break;
                case "Update a department":
                    console.log("update a department");
                    break;
                case "Update a role":
                    console.log("update a role");
                    break;
                case "Remove an employee":
                    console.log("remove employee");
                    break;
                case "Remove a department":
                    console.log("remove department");
                    break;
                case "Remove a role":
                    console.log("remove role")
                    break;
            }

        })
}

function viewEmployees() {
    connection.query("SELECT e.first_name, e.last_name, role.title, role.salary, department.name AS department, m.first_name AS manager_first_name, m.last_name AS manager_last_name FROM employee e LEFT JOIN role ON e.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee m ON e.manager_id = m.id", function (err, res) {
        if (err) throw err;
        console.table(res);
        likeToDo();
    })
}

function viewDepartments() {
    connection.query("SELECT department.name FROM department", function (err, res) {
        if (err) throw err;
        var choicesArray = [];
        for (i = 0; i < res.length; i++) {
            choicesArray.push(res[i].name)
        }
        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Which department would you like to view?",
                    choices: choicesArray,
                    name: "whichDepartment"
                }
            ]).then(function (response) {
                connection.query("SELECT department.name, role.title, employee.first_name, employee.last_name FROM department LEFT JOIN role ON department.id = role.department_id LEFT JOIN employee ON role.id = employee.role_id WHERE ?",
                    {
                        name: response.whichDepartment
                    }, function (err, res) {
                        if (err) throw err;
                        console.table(res);
                        likeToDo();
                    })
            })
    })
}

likeToDo();

