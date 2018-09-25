const express= require('express'), http = require('http');
const app   = express();
const cors  = require('cors');
const router = require('router');

let config=require('./config');
app.set('port',process.env.PORT||config.server_port)

const connection=mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: '1234',
    database: 'HomeIoT',
    port: '3306',
})
connection.connect();

app.use(cors());



let dashboard=require('./db/dashboard');
dashboard.init(connection);


router.route('/dashboard/consumption').get(dashboard.consumption);
router.route('/Scheduling/Edit:id').post(dashboard.editSchedule);


function sendJSON(res, result, obj){
    res.json(obj)
}

app.listen(3001,()=>{
    console.log('server is starting..')
})
