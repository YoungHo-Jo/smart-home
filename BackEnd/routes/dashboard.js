let express = require('express');
let router = express.Router();


router.route('/line').get((req,res)=>{
    console.log('line');
    let query=` select date,sum(consumption) as sum from consumption_9_2018 group by date;`;


    req.app.get('db').query(query,(err,rows)=>{
        console.log(rows);
        if(err) console.log(err);
        else sendJSON(res,true,rows);
    })
})


router.route('/lastMonth').get((req,res)=>{
    console.log(req.query);
    let month=req.query.month;
    let query=`select plug,sum(consumption) as sum from consumption_${month}_2018 group by plug order by sum DESC;`

    req.app.get('db').query(query,(err,rows)=>{
        if(err) console.log(err);
        else    sendJSON(res,true,rows);
    })
})

function sendJSON(res, result, obj){
    res.json(obj)
}
module.exports=router;
