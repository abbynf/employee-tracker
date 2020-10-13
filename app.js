const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: "@Ecuador14",
    database: "employee_db"
})

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected", connection.threadId);
    connection.end();
})