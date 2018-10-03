const mysql = require('mysql');

const connection=mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: '1234',
    database: 'homeiot',
    port: '3306',
})
connection.connect();

module.exports=connection;
