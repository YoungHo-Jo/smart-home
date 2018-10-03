import React from 'react'
import '../css/component.css'
import request from 'superagent'

export default class PlanBtn extends React.Component{
    state={
        data:[]
    }

    componentDidMount(){
        request
            .get(global.url+'/remotecontrol/soon')
            .end((err,res)=>{
                if(err) console.log(err);
                console.log(res.body);
                this.setState({
                    data:res.body,
                })
            })
    }

    shouldComponentUpdate(nextProps, nextState){
        return nextState.data !== this.state.data;
    }

    removePlan=(e)=>{
        console.log(e.target)
        /*request
            .get(url+'/cancel')
            .query({value:'plug3'}) // 친구 OFF 요청
            .end((err,res)=>{
                if(err) console.log(err);
                this.setState({
                    data: res.body,
                })
            })
        */
    }

    render(){
        const list = this.state.data.map(
            btn => (<button onClick={this.removePlan} className={`${btn.showStyle?'button-reveal':'button-hidden'}`}> {btn.value}</button>)
        )
        return (
            <div id='plan-contain'>
                <div className='plan'>
                    {list}
                </div>
            </div>
        )
    }
}
