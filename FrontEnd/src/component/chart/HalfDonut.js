import React from 'react'
import {VictoryPie} from 'victory'

export  default class HalfDonut extends React.Component{
    render(){
        return (
            <VictoryPie
                colorScale={["rgba(255,255,255, 0.5)"]}
                innerRadius={120}
                width={this.props.width}
                padding={10}
                endAngle={0}
                startAngle={this.props.angle}
            />
        )
    }
}
