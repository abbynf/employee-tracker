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
                choices: ["View employees", "View departments", "View roles", "Add an employee", "Add a department", "Add a role", "Update an employee", "Update a department", "Update a role"],
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
                    updateEmployee();
                    break;
                case "Update a department":
                    updateDept();
                    break;
                case "Update a role":
                    console.log("update a role");
                    updateRole();
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
    }).then(function (deptId) {
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

function insertRole(valuesArray) {
    return new Promise((resolve, reject) => {
        connection.query("INSERT INTO role (title, salary, department_id) VALUES (?)", [valuesArray], function (err, res) {
            if (err) {
                reject(err);
            }
            console.log("Succesfully created role")
            return (res);
        })
    })
}

function updateEmployee() {
    var employeeArray = [];
    var rolesArray = [];
    var managerArray = [];
    var newValues = [];
    var inqResults = [];
    allEmployees.then(function (empList) {
        employeeArray = empList;
        managerArray = empList;
        managerArray.push("No manager")
        return allRoles;
    }).then(function (roleList) {
        rolesArray = roleList;
        return updateEmpInq(employeeArray, rolesArray, managerArray)
    }).then(function (empInqAnswers) {
        newValues.push(empInqAnswers.empFirst);
        newValues.push(empInqAnswers.empLast);
        inqResults = empInqAnswers;
        return roleToId(empInqAnswers.empRole)
    }).then(function (roleId) {
        newValues.push(roleId);
        if (inqResults.empMan !== "No manager") {
            var splitManager = inqResults.empMan.split(" ");
            var managerFirst = splitManager[0];
            var managerLast = splitManager[1];
            return managerNameToId(managerFirst, managerLast)
        } else {
            return null;
        }
    }).then(function (manResult) {
        newValues.push(manResult);
        var splitChosen = inqResults.chosenEmployee.split(" ");
        var chosenFirst = splitChosen[0];
        var chosenLast = splitChosen[1];
        newValues.push(chosenFirst);
        newValues.push(chosenLast);
        updEmpDB(newValues);
        likeToDo();
    })
}

function updateEmpInq(employeeArray, rolesArray, managerArray) {
    return new Promise((resolve, reject) => {

        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Which employee would you like to update?",
                    choices: employeeArray,
                    name: "chosenEmployee"
                },
                {
                    type: "input",
                    message: "What is the employee's first name?",
                    name: "empFirst",
                },
                {
                    type: "input",
                    message: "What is the employee's last name?",
                    name: "empLast"
                },
                {
                    type: "list",
                    message: "What is the employee's role?",
                    choices: rolesArray,
                    name: "empRole"
                },
                {
                    type: "list",
                    message: "Who is the employee's manager?",
                    choices: managerArray,
                    name: "empMan"
                }
            ]).then(function (response) {
                resolve(response);
            })
    })
}

function updEmpDB(newValues) {
    return new Promise((resolve, reject) => {
        var query = connection.query("UPDATE employee SET first_name=?, last_name=?, role_id=?, manager_id=? WHERE first_name=? AND last_name=?", newValues, function (err, res) {
            if (err) {
                reject(err)
            }
            console.log(query.sql)
            console.log("Success");
            resolve(res);
        })
    })
}

function updateDept() {
    var newValues = [];
    // get list of departments
    departmentList()
        .then(function (deptList) {
            // send the list of departments to function to ask which department would they like to change, change it to
            return chooseDept(deptList);
        }).then(function (inqResults) {
            // format responses to be put into UPDATE query
            newValues.push(inqResults.newDeptName);
            newValues.push(inqResults.chosenDept);
            // send results to function to update DB
            return updateDeptDB(newValues)
        }).then(function (results) {
            // alert user of success
            console.log(results.message);
            console.log("Success!")
            // send back to start
            likeToDo();
        })
}

function chooseDept(deptList) {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Which department would you like to update?",
                    choices: deptList,
                    name: "chosenDept"
                },
                {
                    type: "input",
                    message: "Update the department name to:",
                    name: "newDeptName"
                }
            ]).then(function (response) {
                resolve(response)
            })
    })
}

function updateDeptDB(newValues) {
    return new Promise((resolve, reject) => {
        connection.query("UPDATE department SET name=? WHERE name=?", newValues, function (err, res) {
            if (err) {
                reject(err)
            }
            resolve(res);
        })
    })
}

function updateRole() {
    var roleChoices = [];
    var deptChoices = [];
    var newValues = [];
    var inqResults;
    // get list of roles that can be updated
    allRoles.then(function (roleList) {
        roleChoices = roleList;
        // get list of departments that the role can be sent to 
        return departmentList();
    }).then(function (deptList) {
        deptChoices = deptList;
        // send both to inquirer function
        return updateRoleQuestions(roleChoices, deptChoices);
    }).then(function(inqAnswers){
        // Save inqAnswers so chosen role can be pushed to the back of the array
        inqResults = inqAnswers;
        // push values to new array
        newValues.push(inqAnswers.roleName);
        newValues.push(inqAnswers.salary);
        // change department chosen to function to convert to id number
        return deptToId(inqAnswers.dept)
    }).then(function(deptId){
        // push deptId to values array
        newValues.push(deptId);
        newValues.push(inqResults.chosenRole);
        console.log(newValues);
        // send values to function to update db
        return updateRoleDB(newValues);
    }).then(function(result){
        // console log success
        console.log("Success!")
        console.log(result.message);
        // send back to start
        likeToDo();
    })
}

function updateRoleQuestions(roleChoices, deptChoices) {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Which role would you like to update?",
                    choices: roleChoices,
                    name: "chosenRole"
                },
                {
                    type: "input",
                    message: "Update title to:",
                    name: "roleName"
                },
                {
                    type: "input",
                    message: "Update salary to:",
                    name: "salary"
                },
                {
                    type: "list",
                    message: "Update department to:",
                    choices: deptChoices,
                    name: "dept"
                }
            ]).then(function(response){
                resolve(response);
            })
    })
}

function updateRoleDB(newValues){
    return new Promise((resolve, reject) => {
        connection.query("UPDATE role SET title=?, salary=?, department_id=? WHERE title=?", newValues, function(err, res){
            if (err){
                reject(err);
            }
            resolve(res);
        })
    })
}