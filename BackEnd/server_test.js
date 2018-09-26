const express= require('express'), http = require('http');
const app   = express();
const cors  = require('cors');
const mysql = require('mysql');
const moment  = require('moment')

let table_name='';
let this_month=9;

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

//월마다 테이블 생성
let checkMonth=()=>{
    let date= new Date();
    let day=date.getDay();
    if(day===1){
        let year=date.getFullYear();
        let month=date.getMonth()+1;
        createTable(month);
        this_month=++this_month%12+1;
    }
}

let createTable=(year, month)=>{
    let query=`create table consumption_${month} (date DATE, plug INT, start TIME, end TIME, consumption INT);`
    //if not existst 추가. date에 auto 속성 추가
    connection.query(query,(err, rows, field)=>{
        if(err) console.log(err);
        else {
            console.log('table is created');
            table_name=`consumption_${month}_${year}`;
        }
    })
}
//주기적으로 플러그가 켜져있는게 맞는지 체크하는 함수 (모비우스 와 통신하는 )
app.post('/status',(req,res)=>{ //분단위로 오면 베리굿
    prev_status=[0,0,0,0];

    for(let num=1; num<4; ++num) {
        if(`plug${num}` === '1' && !prev_status[num]) {
            //start
        }

        else if(`plug${num}` === '0' && prev_status[num]) {
            //end
        }
    }

})
app.get('/line',(req,res)=>{
    console.log('line');

    let query=` select date,sum(consumption) as sum from consumption_9_2018 group by date;`
    connection.query(query,(err,rows,fields)=>{
        console.log(rows);
        if(err) console.log(err);
        else sendJSON(res,true,rows);

    })
})

app.get('/lastMonth', (req,res)=>{
    console.log(req.query);
    let month=req.query.month;
    //let last_month=this_month<=10 ? `0${this_month-1}` : `${this_month-1}`
    let query=`select plug,sum(consumption) as sum from consumption_${month}_2018 group by plug order by sum DESC;`

    connection.query(query,(err,rows,field)=>{
        if(err) console.log(err);
        else    sendJSON(res,true,rows);
    })
})


app.get('/dummy', (req,res)=>{
    for(let i=0; i<50; ++i) {
        let day = Math.floor(Math.random() * 30) + 1;
        let quantity = Math.floor(Math.random() * 300) + 50;
        let plug = Math.floor(Math.random() * 4) + 1;
        console.log(day, plug, quantity);

        let query = `insert into consumption_8_2018 values('2018-08-${day}', ${plug}, null, null,${quantity});`
        connection.query(query, (err, rows, field) => {
            if (err) console.log(err);
            else console.log(rows);
        })
    }

})

function sendJSON(res, result, obj){
    res.json(obj)
}

app.listen(3001,()=>{
    console.log('server is starting..')
})
