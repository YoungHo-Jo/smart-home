let db;

let init=function(connection){
    console.log('init');
    db=connection;
};

let consumption= (req,res)=>{
    console.log(req.query);
    start=req.query.start;
    end=req.query.end;
    const db=req.app.get('db');


    const query=``;
    //query=`select objects.name, comsump from objects, comsumption_records_8 where objects.obj_id=comsumption_records_8.obj_id \
    //      AND "${start}" <= date AND date <="${end}" ;`

    db.query(query, (err,rows,field)=>{
        if(err) console.log(err);
        sendJSON(res, true, rows)
    })

};

let editSchedule = (req,res)=>{
    let _num=parseInt(req.query.obj)
    let query = ``
    // `update reserved_objs set obj_id=${_num},start_time="${q.start}",end_time="${q.end}" where obj_id=${_num};`

    connection.query(query, (err,rows,field)=>{
        if(err) console.log(err);
        sendJSON(res, true, rows)
    })
}



module.exports.init=init;
module.exports.consumption=consumption;
module.exports.editSchedule=editSchedule;
