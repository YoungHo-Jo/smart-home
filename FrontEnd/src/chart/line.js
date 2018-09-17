import React from 'react'
import {VictoryAxis, VictoryChart, VictoryPie, VictoryTheme} from 'victory'

const data=[
    { x: "Cats", y: 73 },
    { x: "Dogs", y: 10 },
    { x: "Birds", y: 55 }
]

class line2 extends React.Component {
    render() {
        return (
            <VictoryPie
                colorScale={["tomato","orange", "cyan","navy"]}
                data={data}
                padAngle={2}
                innerRadius={100}
                width={1000}
                padding={10}
            />

        )
    }
}

export default line2
