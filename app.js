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
    likeToDo();
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
            switch (response.likeToDo) {
                case "View employees":
                    viewEmployees();
                    break;
                case "View departments":
                    viewDepartments();
                    break;
                case "View roles":
                    viewRoles();
                    break;
                case "Add an employee":
                    console.log("add ane mployee");
                    addEmployee();
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

function viewRoles() {
    connection.query("SELECT role.title, role.salary, department.name AS department FROM role LEFT JOIN department ON role.department_id = department.id", function (err, res) {
        if (err) throw err;
        var rolesArray = [];
        console.table(res);
        for (i = 0; i < res.length; i++) {
            rolesArray.push(res[i].title)
        }
        rolesArray.push("No, take me back to start");
        inquirer
            .prompt([{
                type: 'list',
                message: "Would you like to view all of the employees in a role?",
                name: "viewOneRoleEmployees",
                choices: rolesArray
            }
            ]).then(function (response) {
                console.log(response.viewOneRoleEmployees);
                if (response.viewOneRoleEmployees !== "No, take me back to start") {
                    connection.query("SELECT role.title, employee.first_name, employee.last_name FROM role LEFT JOIN employee ON role.id = employee.role_id WHERE ?", {
                        title: response.viewOneRoleEmployees
                    }, function (err, res) {
                        if (err) throw err;
                        console.table(res);
                    })
                }
                else likeToDo();
            })
    })
}

function addEmployee() {
    var employeesArray;
    var rolesArray;
    var reultsOfInquirer;
    var newValues = [];

    allEmployees.then(function (result) {
        employeesArray = result;
        return allRoles;
    }).then(function (newResult) {
        rolesArray = newResult;
        return newEmployeeQuestions(rolesArray, employeesArray)
    }).then(function (inquirerResults) {
        reultsOfInquirer = inquirerResults;
        console.log(reultsOfInquirer);
        newValues.push(reultsOfInquirer.employeeFirst);
        newValues.push(reultsOfInquirer.employeeLast);
        return roleToId(reultsOfInquirer.employeeRole);
    }).then(function (roleResults) {
        newValues.push(roleResults);
        if (reultsOfInquirer.chooseManager !== "No manager") {
            console.log("ye have chosen a manager")
            var splitManager = reultsOfInquirer.chooseManager.split(" ");
            var managerFirst = splitManager[0];
            var managerLast = splitManager[1];
            return managerNameToId(managerFirst, managerLast)
        } else {
            return null;
        }
    }).then(function (resultOfManager){
        newValues.push(resultOfManager);
        insertNewEmployee(newValues);
    })
}


function newEmployeeQuestions(rolesArray, employeesArray) {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([
                {
                    type: "input",
                    message: "What is the first name of the employee?",
                    name: "employeeFirst"
                },
                {
                    type: "input",
                    message: "What is the last name of the employee?",
                    name: "employeeLast"
                },
                {
                    type: "list",
                    message: "What is the role of the employee?",
                    choices: rolesArray,
                    name: "employeeRole"
                },
                {
                    type: "list",
                    message: "Who is this employee's manager?",
                    choices: employeesArray,
                    name: 'chooseManager'
                }

            ]).then(function (response) {
                resolve(response);
            })
    }
    )
}





let allEmployees = new Promise((resolve, reject) => {
    connection.query("SELECT first_name, last_name FROM employee", function (err, res) {
        if (err) throw err;
        var employeeArray = [];
        for (i = 0; i < res.length; i++) {
            var wholeName = res[i].first_name.concat(' ', res[i].last_name);
            employeeArray.push(wholeName);
        }
        employeeArray.push("No manager");
        resolve(employeeArray);
    })
})

let allRoles = new Promise((resolve, reject) => {
    var rolesArray = [];
    connection.query("SELECT title FROM role", function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            rolesArray.push(res[i].title)
        }
        resolve(rolesArray);
    })
})

function roleToId(title) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT id FROM role WHERE title=?", [title], function (err, res) {
            if (err) {
                reject(err)
            };
            resolve(res[0].id);
        })
    })
}

function managerNameToId(manFirstName, manLastName){
    return new Promise((resolve, reject) => {
        connection.query("SELECT id FROM employee WHERE first_name=? AND last_name=?", [manFirstName, manLastName], function(err, res){
            if (err){
                reject(err)
            }
            resolve(res[0].id)
        })
    })
}

function insertNewEmployee(employeeValues){
    return new Promise((resolve, reject) => {
        console.log(employeeValues);
        connection.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)', [employeeValues], function(err, res){
            if (err){
                reject(err)
            }
            resolve(res);
        })
    })
}
