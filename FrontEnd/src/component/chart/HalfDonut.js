import React from 'react'
import {VictoryPie} from 'victory'
import request from 'superagent'

export default class HalfDonut extends React.Component{
    state= {
        start:0,
        end:0
    }

    componentWillMount(){
        request
            .get(global.url+this.props.url)
            .end((err, res) => {
                if (err) {
                    console.log("Error:", err)
                    return
                }
                this.setState({
                    start:res.start,
                    end:res.end
                })
            })
    }

    render(){
        return (
            <VictoryPie
                colorScale={["rgba(255,255,255, 0.5)"]}
                innerRadius={120}
                width={this.props.width}
                padding={10}
                endAngle={this.state.end}
                startAngle={this.state.start}
            />
        )
    }
}
