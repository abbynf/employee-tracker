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
        .then(function(response){
            switch (response) {
                case "View employees":
                    console.log("you have chosen view employees")
                    break;
                case "View departments":
                    console.log("You have chosen view departments")
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

likeToDo();