import React from 'react'
import {VictoryAxis, VictoryChart, VictoryTheme, VictoryLine} from 'victory'

const data=[
    { x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 5 }, { x: 4, y: 4 }, { x: 6, y: 7 },
    { x: 7, y: 2 }, { x: 8, y: 3 }, { x: 11, y: 2 }, { x: 12, y: 3 },
    { x: 13, y: 5 }, { x: 14, y: 4 }, { x: 16, y: 7 }, { x: 17, y: 2 },
    { x: 18, y: 3 }, { x: 21, y: 2 }, { x: 22, y: 3 }, { x: 23, y: 5 },
    { x: 24, y: 4 }, { x: 26, y: 7 }, { x: 27, y: 2 }, { x: 28, y: 3 },
]


class lineChart extends React.Component {
    render() {
        return (
            <VictoryChart
                theme={VictoryTheme.material}
                height ={120}
                width = {700}
                padding={30}
                margin={0}
                domainPadding={{x:40, y:10}}
            >

                <VictoryAxis
                    style={{
                        axis: {stroke: "#756f6a"},
                        ticks: {stroke: "black", size: 5},
                        tickLabels: {fontSize: 10, padding: 5}
                    }}
                />
                <VictoryAxis
                    dependentAxis
                    style={{
                        axis: {stroke: "#756f6a"},
                        ticks: {stroke: "black", size: 5},
                        tickLabels: {fontSize: 10, padding: 5}
                    }} />


                <VictoryLine
                    style={{
                        data: { stroke: "#339999", strokeWidth: 2  },
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

export default lineChart
