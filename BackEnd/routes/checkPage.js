let express = require('express');
let router = express.Router();


router.route('/date_record').get((req,res)=>{
    let start=req.query.start.substr(0,10);
    let end=req.query.end.substr(0,10);
    let start_month=req.query.start.substr(5,1);
    let end_month=req.query.end.substr(5,1);
    let query=``;
    console.log(start_month, end_month);

    if(start_month===end_month)
        query=`select plug as x, sum(consumption) as y from consumption_${start_month}_2018 where date>='${start}' AND date<='${end}'\
                group by x order by y DESC`;
    else
        query=`select * from consumption_${start_month}_2018`;

    req.app.get('db').query(query,(err,rows)=>{
        if(err) console.log(err);
        console.log(rows);
        sendJSON(res,true,rows);
    })
})

function sendJSON(res, result, obj){
    res.json(obj)
}

module.exports=router;
