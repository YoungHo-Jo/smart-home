const express= require('express'), http = require('http');
const app   = express();
const cors  = require('cors');


let table_name='';

let db = require('./db/mysql');
app.set('db',db);
app.set('port',3010)
app.use(cors())

let checkMonth=require('./routes/checkDate').checkMonth();
let createTable=(year, month)=>{
    let query=`create table consumption_9 (date DATE, plug INT, start TIME, end TIME, consumption INT);`
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
    for(let j=1; j<10; j++){

        for(let i=0; i<50; ++i) {
            let day = Math.floor(Math.random() * 30) + 1;
            let quantity = Math.floor(Math.random() * 300) + 50;
            let plug = Math.floor(Math.random() * 4) + 1;
            console.log(day, plug, quantity);

            let query = `insert into consumption_${j}_2018 values('2018-${j}-${day}', ${plug}, null, null,${quantity});`
            req.app.get('db').query(query, (err, rows) => {
                if (err) console.log(err);
                else console.log(rows);
            })
        }

    }
})

let remotecontrol = require('./routes/remoteControl');
app.use('/remotecontrol', remotecontrol);

let dashboard = require('./routes/dashboard');
app.use('/dashboard',dashboard);

let checkPage = require('./routes/checkPage');
app.use('/checkpage',checkPage);

let tablePage = require('./routes/tablePage');
app.use('/tablepage',tablePage)


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


var server = require('http').createServer(app)
var io = require('socket.io')(server)
io.on('connection', (socket) => {
    console.log('Socket.io connected')
    
})

server.listen(app.get('port'))

var mobius = require('./mobius')(io)
