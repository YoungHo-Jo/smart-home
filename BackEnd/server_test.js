const express= require('express'), http = require('http');
const app   = express();
const cors  = require('cors');
const mqtt = require('mqtt');
const mysql = require('mysql');

let table_name='';

const connection=mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: '1234',
    database: 'HomeIoT',
    port: '3306',
})
connection.connect();

app.set('db',connection);
app.set('port',3010)
app.use(cors())

/*
let checkMonth=require('./routes/checkDate').checkMonth();
let createTable=(year, month)=>{
    let query=`create table consumption_${month} (date DATE, plug INT, start TIME, end TIME, consumption INT);`
    //if not existst 추가. date에 auto 속성 추가
    req.app.get('db').query(query,(err, rows, field)=>{
        if(err) console.log(err);
        else {
            console.log('table is created');
            table_name=`consumption_${month}_${year}`;
        }
    })
}
app.get('/dummy', (req,res)=>{
    for(let i=0; i<50; ++i) {
        let day = Math.floor(Math.random() * 30) + 1;
        let quantity = Math.floor(Math.random() * 300) + 50;
        let plug = Math.floor(Math.random() * 4) + 1;
        console.log(day, plug, quantity);

        let query = `insert into consumption_8_2018 values('2018-08-${day}', ${plug}, null, null,${quantity});`
        req.app.get('db').query(query, (err, rows, field) => {
            if (err) console.log(err);
            else console.log(rows);
        })
    }
})
*/


let dashboard = require('./routes/dashboard');
app.use('/dashboard',dashboard);

let checkPage = require('./routes/checkPage');
app.use('/checkpage',checkPage);

let tablePage = require('./routes/tablePage');
app.use('/tablepage',tablePage)

let client=mqtt.connect('mqtt://52.78.33.177')

client.on('connect',()=>{
    console.log('conecete');
    client.subscribe('/oneM2M/req/Mobius/Ssmart-hom/json',(err)=>{
        if(err) console.log(err);
        else{
            client.on('message',(topic,msg)=>{
                console.log(msg.toString())
            })
        }
    })
})


app.listen(app.get('port'),()=>{
    console.log('server starts..')
})
