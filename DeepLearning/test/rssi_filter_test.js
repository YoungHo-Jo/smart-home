var rssiList = [];

var push_rssi = (rssi_value, size = 10, cut_ratio = 2/5) => {
    var ans = -1;
    rssiList.push(rssi_value);
    if(rssiList.length === size){
        ans = median(rssiList);
        rssiList = rssiList.slice(size * cut_ratio,size+1);
    }
    return ans;
}
        
        
var median = (rssi_list, ratio = 1/3) => {
    var minRssi_value = Number(rssi_list[0]);
    var maxRssi_value = Number(rssi_list[0]);
    var cur_median = Number(rssi_list[0]);
    var ans_average = 0;
    
    rssi_list.forEach((value, index) => {
        if(index === 0) return;
        minRssi_value = Math.min(minRssi_value, value);
        maxRssi_value = Math.max(maxRssi_value, value);
        cur_median = Number((cur_median * index / (index+1) + value * 1 / (index+1)).toFixed(2));
    });
    if(maxRssi_value === minRssi_value)
        return maxRssi_value;
    
    rssi_list.forEach((value, index) => {
        ans_average += value + (value - cur_median) / (maxRssi_value - minRssi_value) * ratio
    });

    return (ans_average / rssi_list.length).toFixed(2);
}

    
var list1 = [60, 60,60,60,60,60,60,60,60,60,58,57,56,55,40,52,51,48,39,40,38,42,30,29]
//var list1 = [30,30,30,30,30,30,30,30,30,30,31,45,33,39,48,39,39,43,47,50,52,52,53,54,60,60]
list1.forEach((value, index) => {
    if(push_rssi(value) >= 40){
        console.log("find : " + index + "th -> "+ value);
        return;
    }
});
/**************************************
**  usage
* -----------------------
* push_rssi(rssi_value)
* console.log(push_rssi(rssi_value)) //print


**  example
* -----------------------

* var list1 = [60, 60,60,60,60,60,60,60,60,60,58,57,56,55,40,52,51,48,39,40,38,42,30,29]
* //var list1 = [30,30,30,30,30,30,30,30,30,30,31,45,33,39,48,39,39,43,47,50,52,52,53,54,60,60]
* list1.forEach((value, index) => {
*     if(push_rssi(value) >= 40){
*         console.log("find : " + index + "th -> "+ value);
*         return;
*     }
* });
***************************************/