let express = require('express');
let router = express.Router();

let data=[{time:'1', value:'plug1', showStyle:false},
        {time:'2', value:'plug2', showStyle:false},
        {time:'3', value:'plug3', showStyle:true},
        {time:'4', value:'plug4', showStyle:false},
        {time:'5', value:'plug5', showStyle:false},
        {time:'6', value:'plug6', showStyle:false},
        {time:'7', value:'plug7', showStyle:true},
        {time:'8', value:'plug8', showStyle:true},
        {time:'9', value:'plug9', showStyle:false},
        {time:'10', value:'plug10', showStyle:false},]

router.route('/soon').get((req,res)=>{
    sendJSON(res,true, data)
})

router.route('/cancel').get((req,res)=>{
        console.log( data[value].indexOf(req.query.value) );
        if(req.query.value.showStyle===true)
                req.query.value.showStyle=false;

        sendJSON(res,true,data);
})

function sendJSON(res, result, obj){
    res.json(obj)
}


module.exports=router;
