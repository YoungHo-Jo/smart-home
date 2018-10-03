
let this_month=9;

let check={

    checkMonth:()=>{
        let date= new Date();
        let day=date.getDay();
        if(day===1){
            let year=date.getFullYear();
            let month=date.getMonth()+1;
            //createTable(month);
            this_month=++this_month%12+1;
        }
    }
}


module.exports=check;
