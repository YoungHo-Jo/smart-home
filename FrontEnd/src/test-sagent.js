const request=require('superagent');
const URL   ="http://localhost:3001/getData"


request.get(URL).end(callbackGet)

function callbackGet(err, res){
    if(err) return
    console.log(res.body)
}