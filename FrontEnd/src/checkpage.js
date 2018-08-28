import React from 'react'
import Consumption from "./Consumption"
import './App.css'
import Calendar from 'react-calendar'
import request from "superagent";
import { Button } from 'semantic-ui-react'
import DateForm from './Component/DateForm'


let now= new Date()

export default class checkpage extends React.Component{
    state={
        locale:null,
        date: new Date(),
        maxDate: new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 15, 12),
        maxDetail: 'month',
        returnValue: 'start',
        selectRange: true,
        start:'',
        end:''
    }

    onChange = (value) => {
        let s=value[0]
        let e=value[1]
        this.setState({
            value,
            start: `${s.getFullYear()}-${s.getMonth()+1}-${s.getDate()}`,
            end: `${e.getFullYear()}-${e.getMonth()+1}-${e.getDate()}`
        })
    }

    Post = () =>{
        console.log(this.state.start, this.state.end)
        request
            .get('http://localhost:3001/api/comsumption')
            .query({
                start:this.state.start,
                end:this.state.end
            })
            .end((err,res)=>{
                if(err) throw err

            })
    }

    render(){
        return(
            <div className='main'>
                <div className='date-btn-group'>
                    <button className="button">Today</button>
                    <button className="button">Week</button>
                    <button className="button">Month</button>
                    <button className="button">Year</button>
                </div>

                <p className='cal-graph-left'>
                    <DateForm style={{'margin-top':'20px'}}/>
                    <Calendar className=    'cal'
                              onChange=     {this.onChange}
                              selectRange=  {this.state.selectRange}
                              value=        {this.state.value} />
                       <Button color='teal'onClick={e=> this.Post(e)} attached='right'> 조회 </Button>
                </p>
                <p className='cal-graph-right'>
                    <Consumption />
                </p>

            </div>
        )
    }
}
