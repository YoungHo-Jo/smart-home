import React from 'react'
import './css/App.css'
import Calendar from 'react-calendar'
import request from "superagent";
import DateForm from './Component/DateForm'
import Barchart from './chart/barchart'

let now     = new Date()
let month   = new Date()
let week    = new Date()
let year    = new Date()
month.setMonth(now.getMonth()-1);
week.setDate(now.getDay()-5)
year.setFullYear(now.getFullYear()-1)


const LineData1= [{"name":"","comsump":0}]

export default class checkpage extends React.Component{
    state={
        locale:null,
        date: new Date(),
        maxDate: new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 15, 12),
        maxDetail: 'month',
        returnValue: 'start',
        selectRange: true,
        start:`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`,
        end:`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`,
        data:LineData1
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

    Post = (e) =>{
        console.log(this.state.start, this.state.end)
        request
            .get('http://localhost:3001/api/comsumption')
            .query({
                start:this.state.start,
                end:this.state.end
            })
            .end((err,res)=>{
                if(err) throw err
                console.log(res.text)
                let result= JSON.parse(res.text)
                this.setState({
                    data: result
                })
            })
    }

    setData = (value)=>{
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
        return(
            <div className='main'>
                <div className='contain-2box'>
                    <div className='boxex-2'>
                        <DateForm from={this.state.start} to={this.state.end}/>
                        <button className="button-date button-red" onClick={e=> this.setData([now, now])}><span className='text2'> Today</span></button>
                        <button className="button-date button-green" onClick={e=> this.setData([week, now])}> <span className='text2'> Week </span> </button>
                        <button className="button-date button-yellow" onClick={e=> this.setData([month, now])}> <span className='text2'> Month</span> </button>
                        <button className="button-date button-blue" onClick={e=> this.setData([year, now])}> <span className='text2'> Year</span> </button>
                        <button className="button-date button-purple" onClick={e=> this.Post(e)}> <span className='text2'> Check</span> </button>

                    </div>
                    <div className='boxex-2'>
                        <div className='cal'>
                            <Calendar
                                  onChange      = {this.onChange}
                                  selectRange   = {this.state.selectRange}
                                  value         = {this.state.value}
                                  marigin       = {'auto auto'}
                            />
                        </div>
                </div>
                </div>
                <div className='linechart'>
                    <Barchart data={this.state.data}/>
                </div>
            </div>
        )
    }
}
