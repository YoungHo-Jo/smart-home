import React from 'react'
import {VictoryAxis, VictoryChart, VictoryPie, VictoryTheme} from 'victory'


class Donut extends React.Component {
    render() {
        return (
            <VictoryPie
                colorScale={["MidnightBlue", "MediumBlue ","RoyalBlue ","CornflowerBlue","LightSkyBlue ","LightSteelBlue"]}
                data={this.props.data}
                padAngle={2}
                innerRadius={100}
                width={1000}
                padding={10}
            />
        )
    }
}

export default Donut
