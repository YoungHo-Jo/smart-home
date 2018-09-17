import React from 'react'
import './css/App.css'
import Donut2 from './chart/Donut'
import Donut from './chart/Donut2'
import plan from './Component/schedule'

import {Icon} from 'semantic-ui-react'

const data2=[
    { x: "plug 1", y: 73 },
    { x: "plug 5", y: 73 },
    { x: "plug 6", y: 40 },
    { x: "plug 3", y: 40 },
    { x: "plug 4", y: 20 },
    { x: "plug 2", y: 20 }
]
const data1=[
    {x:"Airconditioner",y:2.64},
    {x:"Refrigerator",y:0.97},
    {x:"Television",y:0.7},
    {x:"HairDrier",y:0.23},
    {x:"Computer",y:0.43},
    {x:"Charger",y:0.12}
    ]

class Home extends React.Component{
    render(){
        return(
            <div className='main'>
                <div className='button-container'>
                    <button className="button-home button-red"><span className='text'> Home </span><Icon className='img' color='black' size={"large"} disabled name='plug'/></button>
                    <button className="button-home button-yellow"><span className='text'> Reserver Objects </span><Icon className='img' color='black' size={"large"} disabled name='users'/></button>
                    <button className="button-home button-green"><span className='text'> Current Status</span><Icon className='img' color='black' size={"large"} disabled name='users'/></button>
                    <button className="button-home button-blue"><span className='text'>Power Consumption</span><Icon className='img' color='black' size={"large"} disabled name='chart bar'/></button>
                </div>
                <div className="linechart">
                    <h3> This Month </h3>
                    <Donut2 />
                </div>
                <div className='contain-2box'>
                    <div className="boxex-2">
                        <h3>Previous Month</h3>
                        <Donut data={data1}/>
                    </div>
                    <div className="boxex-2">
                        <h3>This Month</h3>
                        <Donut data={data2}/>
                    </div>
                </div>
                <plan/>

            </div>
        )
    }
}

export default Home
