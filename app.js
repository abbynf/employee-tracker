const mysql = require('mysql');
var inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: "@Ecuador14",
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
                    addEmployee();
                    break;
                case "Add a department":
                    addDepartment();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Update an employee":
                    console.log("update employee");
                    updateEmployee();
                    break;
                case "Update a department":
                    console.log("update a department");
                    break;
                case "Update a role":
                    console.log("update a role");
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
    var employeesArray = [];
    var rolesArray = [];
    var reultsOfInquirer;
    var newValues = [];

    allEmployees.then(function (result) {
        result.push("No manager");
        employeesArray = result;
        return allRoles;
    }).then(function (newResult) {
        rolesArray = newResult;
        return newEmployeeQuestions(rolesArray, employeesArray)
    }).then(function (inquirerResults) {
        reultsOfInquirer = inquirerResults;
        newValues.push(reultsOfInquirer.employeeFirst);
        newValues.push(reultsOfInquirer.employeeLast);
        return roleToId(reultsOfInquirer.employeeRole);
    }).then(function (roleResults) {
        newValues.push(roleResults);
        if (reultsOfInquirer.chooseManager !== "No manager") {
            var splitManager = reultsOfInquirer.chooseManager.split(" ");
            var managerFirst = splitManager[0];
            var managerLast = splitManager[1];
            return managerNameToId(managerFirst, managerLast)
        } else {
            return null;
        }
    }).then(function (resultOfManager) {
        newValues.push(resultOfManager);
        insertNewEmployee(newValues);
        console.log("Success!")
        return likeToDo();
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

function managerNameToId(manFirstName, manLastName) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT id FROM employee WHERE first_name=? AND last_name=?", [manFirstName, manLastName], function (err, res) {
            if (err) {
                reject(err)
            }
            resolve(res[0].id)
        })
    })
}

function insertNewEmployee(employeeValues) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)', [employeeValues], function (err, res) {
            if (err) {
                reject(err)
            }
            resolve(res);
        })
    })
}

function addDepartment() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the name of the new department?",
                name: "newDeptName"
            }
        ]).then(function (response) {
            connection.query("INSERT INTO department (name) VALUES (?)", [response.newDeptName], function (err, res) {
                if (err) throw err;
                console.log("Successfully added department");
            })
        })
}

function addRole() {
    var newRoleValues = [];
    departmentList().then(function (deptResult) {
        console.log(deptResult);
        return roleQuestions(deptResult);
    }).then(function (roleInqResults) {
        newRoleValues.push(roleInqResults.newTitle);
        newRoleValues.push(roleInqResults.roleSalary);
        return deptToId(roleInqResults.roleDept);
    }).then(function(deptId){
        newRoleValues.push(deptId);
        return insertRole(newRoleValues);
    })
}

function departmentList() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT name FROM department", function (err, res) {
            if (err) {
                reject(err);
            }
            var deptArray = [];
            for (i = 0; i < res.length; i++) {
                deptArray.push(res[i].name);
            }
            resolve(deptArray);
        })
    })
}

function roleQuestions(choiArr) {
    return new Promise((resolve, reject) => {

        inquirer
            .prompt([
                {
                    type: "input",
                    message: "What is the new title?",
                    name: "newTitle"
                },
                {
                    type: "input",
                    message: "What is the salary?",
                    name: "roleSalary"
                },
                {
                    type: "list",
                    message: "What department does the role belong to?",
                    name: "roleDept",
                    choices: choiArr
                }
            ]).then(function (response) {
                resolve(response);
            })
    })
}

function deptToId(dept) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT id FROM department WHERE name=?", [dept], function (err, res) {
            if (err) {
                reject(err)
            };
            resolve(res[0].id);
        })
    })
}

function insertRole(valuesArray){
    return new Promise((resolve, reject) => {
        connection.query("INSERT INTO role (title, salary, department_id) VALUES (?)", [valuesArray], function(err, res){
            if (err){
                reject(err);
            }
            console.log("Succesfully created role")
            return (res);
        })
    })
}

function updateEmployee(){
    // pull list of employees
    // inquirer ask whch employees, update each field
    allEmployees.then(function(empList){
        console.log(empList);
        var ind = empList.length - 1;
        var empchoices = empList.splice(3, 0);
        console.log(empchoices)
    })
}

function whichEmployee(){
    return new Promise((resolve, reject) => {

    })
}

function updEmptQuestions() {
    return new Promise((resolve, reject) => {
        inquirer
        .prompt([
            {
                type: "input",
                message: ""
            }
        ])
    })
}