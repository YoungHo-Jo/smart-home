const express= require('express'), http = require('http');
const app   = express();
const cors  = require('cors');
const mysql = require('mysql');
const moment  = require('moment')

const connection=mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: '1234',
    database: 'HomeIoT',
    port: '3306',
})
connection.connect()

app.use('public', express.static('./public'))
app.use(cors())


app.get('/', (req,res)=>{
    res.redirect(302, '/public')
})

app.get("/api/getData", (req, res)=> {
    query= 'select reserved_objs.obj_id, objects.name, start_time, end_time from objects, reserved_objs where objects.obj_id=reserved_objs.obj_id';
    connection.query(query, (err, rows, fields) => {
        if (err) throw err

        console.log(rows)
        sendJSON(res, true, rows)
    });
});


app.get("/api/Monitoring", (req, res)=> {
    let time=moment().format('HH:mm:ss')

    query=`select objects.name, start_time, end_time from objects, reserved_objs \
     where objects.obj_id=reserved_objs.obj_id AND start_time <= "${time}" AND end_time > "${time}" ;`
    connection.query(query, (err, rows, fields) => {
        if (err) throw err

        console.log(rows)
        sendJSON(res, true, rows)
    });
});


app.get('/api/write', (req,res)=>{
    const q = req.query

    console.log(q)
    _num=parseInt(q.obj)
    query =    query = `update reserved_objs set obj_id=${_num},start_time="${q.start}",end_time="${q.end}" where obj_id=${_num};`
    //데이터 갱신 어쩔? 테이블 수정해야댐 기록 하나하나 마다 ID 붙이도록
    connection.query(query, (err,rows,fields)=>{
        if(err) throw err

        console.log(rows)
        sendJSON(res, true, rows)
    })

    console.log(query)
})



app.get("/api/comsumption", (req, res)=> {
    const q = req.query
    console.log(q)
    start= q.start
    end= q.end

    query=`select objects.name, comsump from objects, comsumption_records_8 where objects.obj_id=comsumption_records_8.obj_id \
     AND "${start}" <= date AND date <="${end}" ;`

    connection.query(query, (err, rows, fields) => {
        if (err) throw err

        console.log(rows)
        sendJSON(res, true, rows)
    });
});


function sendJSON(res, result, obj){
    res.json(obj)
}

app.listen(3001,()=>{
    console.log('server is starting..')
})