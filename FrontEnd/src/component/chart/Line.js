import React from 'react'
import {VictoryAxis, VictoryChart, VictoryLine, VictoryTheme} from 'victory'

const data=[
    { x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 5 }, { x: 4, y: 4 }, { x: 6, y: 7 },
    { x: 7, y: 2 }, { x: 8, y: 3 }, { x: 11, y: 2 }, { x: 12, y: 3 },
    { x: 13, y: 5 }, { x: 14, y: 4 }, { x: 16, y: 7 }, { x: 17, y: 2 },
    { x: 18, y: 3 }, { x: 21, y: 2 }, { x: 22, y: 3 }, { x: 23, y: 5 },
    { x: 24, y: 4 }, { x: 26, y: 7 }, { x: 27, y: 2 }, { x: 28, y: 3 },
]


class Line extends React.Component {
    render() {
        return (
            <VictoryChart
                theme={VictoryTheme.material}
                height ={50}
                width = {300}
                padding={12}
                margin={0}
                domainPadding={{x:40, y:10}}
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
                        tickLabels: {fontSize: 5, padding: 5}
                    }} />


                <VictoryLine
                    style={{
                        data: { stroke: "rgba(250,250,0,0.5)", strokeWidth: 1  },
                        parent: { border: "1px solid #ccc"},
                        labels: {fontsize:10},
                        x: "month",
                    }}
                    data={data}
                />
            </VictoryChart>
        )
    }
}

export default Line;
