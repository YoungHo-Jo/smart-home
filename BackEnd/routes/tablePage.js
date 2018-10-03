let express = require('express');
let router = express.Router();


router.route('/Schedule_data').get((req,res)=>{
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
            req.app.get('db').query(query,(err,row,fields)=>{
                if(err) throw err;
            })
        }

        req.app.get('db').query(`insert into today values("0","0","0","0","23:59:59")`)
    });
})
// 하루에 1번 출력 & database drop & recreate 추가.
// query=`create table today (plug1 VARCHAR(1), plug2 VARCHAR(1), plug3 VARCHAR(1), plug4 VARCHAR(1), date time);`
// query= `drop table today;`


router.route('/scheduling_table').get((req,res)=>{
    let query=`select * from today order by date;`;

    let start_record=["00:00:00","00:00:00","00:00:00","00:00:00",];
    let obj_data=[];

    req.app.get('db').query(query,(err,rows,fields)=>{
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


function sendJSON(res, result, obj){
    res.json(obj)
}

module.exports=router;
