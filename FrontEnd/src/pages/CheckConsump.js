import React from 'react'
import '../css/App.css'
import '../css/component.css'

import Calendar from 'react-calendar'
import request from 'superagent'
import HalfDonut from'../component/chart/HalfDonut'
import Barchart from '../component/chart/Bar'
import CheckTable from '../component/CheckTable'


let now     = new Date()
let month   = new Date()
let week    = new Date()
let year    = new Date()
month.setMonth(now.getMonth()-1);
week.setDate(now.getDay()-5)
year.setFullYear(now.getFullYear()-1)

export default class CheckConsump extends React.Component{
    state={
        locale:null,
        date: new Date(),
        maxDate: new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 15, 12),
        maxDetail: 'month',
        returnValue: 'start',
        selectRange: true,
        start:`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`,
        end:`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`,
        bardata:[],
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

    onCheck=(e)=>{
        console.log(this.state.start , this.state.end)
        request
            .get('http://localhost:3010/checkpage/date_record')
            .query({
                start:this.state.start,
                end:this.state.end
            })
            .end((err,res)=>{
                if(err) alert('error')
                console.log(res.text)
                let result=JSON.parse(res.text)
                console.log(result)
                this.setState({bardata:result})
            })
    }

    onSetDate = (value)=>{
        let s= value[0]
        let e= value[1]
        console.log("s,e"+s,e)
        this.setState({
            value,
            start: `${s.getFullYear()}-${s.getMonth()+1}-${s.getDate()}`,
            end: `${e.getFullYear()}-${e.getMonth()+1}-${e.getDate()}`
        })
        console.log(this.state.start, this.state.end)
    }

    render(){
        return (
            <main>
                <div id="date-btn-group">
                    <button onClick={e=> this.onSetDate([week, now])}> WEEK </button>
                    <button onClick={e=> this.onSetDate([month, now])}> MONTH </button>
                    <button onClick={e=> this.onSetDate([year, now])}> YEAR </button>
                    <button onClick={e=>this.onCheck(e)}>CHECK</button>
                </div>
                <div className='box2-wrapper'>
                    <div id='box2-70'>
                        <Barchart data={this.state.bardata}/>
                    </div>
                    <div id='box2-30'>
                        <Calendar
                            onChange      = {this.onChange}
                            selectRange   = {this.state.selectRange}
                            value         = {this.state.value}
                        />
                    </div>
                </div>
                <div className='box3-wrapper'>
                    <div className='box3'>
                        <div>TTT</div>
                        <HalfDonut angle={90} width={800}/>
                    </div>
                    <div className='box3'>
                        <CheckTable data={this.state.bardata}/>
                    </div>
                    <div className='box3'>
                        <div>TTT</div>
                        <HalfDonut angle={90} width={800}/>
                    </div>
                </div>
            </main>
        )
    }
}
