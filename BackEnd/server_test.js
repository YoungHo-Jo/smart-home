const express= require('express'), http = require('http');
const app   = express();
const cors  = require('cors');
const mysql = require('mysql');
const moment  = require('moment')
const request = require('request')
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


let testing=()=>{
    let str="2018-09-26T16:32:03.898Z".substr(11,8);
    console.log(str);
}
testing();

app.get('/Schedule_data', (req,res)=>{
    let options = {
        method: 'GET',
        url: 'http://35.237.55.39:80/api/predict/all',
    }

    request(options, function (error, response, body) {
        let data=JSON.parse(body);
        let time;

        if (error) throw new Error(error);
        for(let num=1; num<data.length-60; num+=60) {
            time=data[num].timestamp.substr(11,8);
            let query=`insert into today values(${data[num].plug1},${data[num].plug2},${data[num].plug3},${data[num].plug4},"${time}")`;
            connection.query(query,(err,row,fields)=>{
                if(err) throw err;
            })
        }

        connection.query(`insert into today values("0","0","0","0","23:59:59")`)
    });
})
// 하루에 1번 출력 & database drop & recreate 추가.
// query=`create table today (plug1 VARCHAR(1), plug2 VARCHAR(1), plug3 VARCHAR(1), plug4 VARCHAR(1), date time);`
// query= `drop table today;`


app.get('/scheduling_test', (req,res)=>{
    let query=`select * from today order by date;`;
    let start_record=["00:00:00","00:00:00","00:00:00","00:00:00",];
    let obj_data=[];

    connection.query(query,(err,rows,fields)=>{
        if(err) throw(err);

        for(let num=0; num<rows.length-1; ++num){
            if(rows[num].plug1!==rows[num+1].plug1)
                rows[num].plug1==="1"
                    ? obj_data.push({'plug':'plug1', 'start':start_record[0], 'end': rows[num+1].date})
                    : start_record[0]=rows[num+1].date;

            if(rows[num].plug2!==rows[num+1].plug2)
                rows[num].plug2==="1"
                    ? obj_data.push({'plug':'plug2', 'start':start_record[1], 'end': rows[num+1].date})
                    : start_record[1]=rows[num+1].date;

            if(rows[num].plug3!==rows[num+1].plug3)
                rows[num].plug3==="1"
                    ? obj_data.push({'plug':'plug3', 'start':start_record[2], 'end': rows[num+1].date})
                    : start_record[2]=rows[num+1].date;

            if(rows[num].plug4!==rows[num+1].plug4)
                rows[num].plug4==="1"
                    ? obj_data.push({'plug':'plug4', 'start':start_record[3], 'end': rows[num+1].date})
                    : start_record[3]=rows[num+1].date;
        }
    })

    setTimeout(()=>{
        let time_base=obj_data.slice();
        time_base.sort((a,b)=>{
                return a.start<b.start ? -1: a.start>b.start ? 1:0;
            })
        obj_data.sort((a,b)=>{
            return a.plug<b.plug ? -1: a.plug>b.plug ? 1:0;
        })

        let json_array=[{'plug':obj_data, 'time':time_base}];
        sendJSON(res, true, json_array)
    },500);

})


let mqtt=require('mqtt');
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

function sendJSON(res, result, obj){
    res.json(obj)
}

app.listen(3001,()=>{
    console.log('server starts..')
})
