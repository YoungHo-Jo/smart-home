import React from 'react'
import '../css/component.css'


export default class PlanBtn extends React.Component{
    state={
        data:[{time:'1', value:'plug1', display:'button-hidden'},
            {time:'2', value:'plug2', display:'button-hidden'},
            {time:'3', value:'plug3', display:'button-reveal'},
            {time:'4', value:'plug4', display:'button-hidden'},
            {time:'5', value:'plug5', display:'button-hidden'},
            {time:'6', value:'plug6', display:'button-hidden'},
            {time:'7', value:'plug7', display:'button-reveal'},
            {time:'8', value:'plug8', display:'button-reveal'},
            {time:'9', value:'plug9', display:'button-hidden'},
            {time:'10', value:'plug10', display:'button-hidden'},]
    }

    removePlan=(e)=>{
        console.log(e.target)
        this.setState({
            [e.target.className]:'button-hidden'
        })
        console.log("1"+e.target.display)
    }

    render(){
        const list = this.state.data.map(
            btn => (<button onClick={this.removePlan} className={btn.display}>{btn.value}</button>)
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
