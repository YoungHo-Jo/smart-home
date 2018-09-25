import React from 'react'
import {VictoryPie} from 'victory'


class Donut extends React.Component {
    render() {
        return (
            <VictoryPie
                colorScale={["#1f2e2e","#5c8a8a ","#94b8b8 ","#b3cccc"]}
                data={this.props.data}
                padAngle={2}
                innerRadius={100}
                width={800}
                padding={10}
            />
        )
    }
}

export default Donut
