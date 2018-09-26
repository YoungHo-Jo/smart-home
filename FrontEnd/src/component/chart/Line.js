import React from 'react'
import {VictoryAxis, VictoryChart, VictoryLine, VictoryTheme} from 'victory'
import request from 'superagent'

class Line extends React.Component {
    state={
        data:[],
    }
    componentDidMount() {
        request
            .get('http://localhost:3001/line')
            .end((err, res) => {
                if (err) console.log(err);
                this.setState({data:res.body});
            })
    }
    render(){
        const items=this.state.data.map(value=>(
            {
                x:parseInt(value.date.substr(8,2)),
                y:value.sum*0.001,
            }
        ))
        console.log(items);
        return (
            <VictoryChart
                theme={VictoryTheme.material}
                height ={50}
                width = {300}
                padding={11}
                margin={5}
            >

                <VictoryAxis
                    style={{
                        axis: {stroke: "rgba(255,255,255, 0.1)"},
                        ticks: {stroke: "black", size: 1},
                        tickLabels: {fontSize: 5, padding: 5}
                    }}
                />
                <VictoryAxis
                    dependentAxis
                    style={{
                        axis: {stroke: "rgba(255,255,255, 0.1)"},
                        ticks: {stroke: "black", size: 1},
                        tickLabels: {fontSize: 5, padding: 1}
                    }} />


                <VictoryLine
                    style={{
                        data: { stroke: "rgba(250,250,0,0.5)", strokeWidth: 1  },
                        parent: { border: "1px solid #ccc"},
                        labels: {fontsize:10},
                        x: "month",
                    }}
                    data={items}
                />
            </VictoryChart>
        )
    }
}

export default Line;
