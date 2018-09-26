import React from 'react'
import {VictoryPie} from 'victory'
import request from 'superagent'


class Donut extends React.Component {
    state={
        data:[]
    }
    componentDidMount(){
        request
            .get('http://localhost:3001/lastMonth')
            .query({month:this.props.month})
            .end((err,res)=>{
                if (err) console.log(err);
                this.setState({data:res.body});
            })
    }
    render() {
        const items=this.state.data.map(value=>({
                x:`plug${value.plug}`,
                y:value.sum,
            }
        ))
        console.log(items);

        return (
            <VictoryPie
                colorScale={["#1f2e2e","#5c8a8a ","#94b8b8 ","#d5ff80"]}
                data={items}
                padAngle={2}
                innerRadius={100}
                width={800}
                padding={10}
            />
        )
    }
}

export default Donut
