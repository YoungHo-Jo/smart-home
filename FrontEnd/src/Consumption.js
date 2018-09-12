import React from 'react';
import BarChart from 'react-bar-chart';


const dd=[{"name":"Airconditioner","comsump":2.64},{"name":"Refrigerator","comsump":0.97},{"name":"Television","comsump":0.7},{"name":"HairDrier","comsump":0.23},{"name":"Computer","comsump":0.43},{"name":"Charger","comsump":0.12}]

let data = [
];

const margin = {top: 20, right: 20, bottom: 30, left: 40};


class Consumption extends React.Component{
    constructor(props){
        super(props)

        dd.forEach((value, idx, arr)=>{
            data.push({text:value.name, value:value.comsump})
        })
        console.log(data)
    }


    render() {
        return (
                <div style={{width: '50%'}}>
                    <BarChart ylabel='Consumption'
                              width={600}
                              height={500}
                              margin={margin}
                              data={data}
                    />
                 </div>
        );
    }
}


export default Consumption
