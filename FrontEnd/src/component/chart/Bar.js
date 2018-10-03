import React from 'react'
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryContainer } from 'victory'
import 'superagent'


export default class Bar extends React.Component {
    constructor(props){
        super(props)
    }


    shouldComponentUpdate(nextProps, nextState){
        return nextProps.data !== this.props.data;
    }

    render() {
        return (
            <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={50}
                scale={{x:"linear", y:"linear"}}
                width={600}
                height={250}
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
                    }}
                    tickFormat={(x) => (`${x}kW`)} />


                <VictoryBar
                    style={{
                        parent: {border: "1px solid #ccc"}
                        ,data: {opacity:0.5, fill:"yellow", stroke:"gray", strokeWidth:1 }}}
                    categories={{
                        x:["plug1","plug2","plug3","plug4",]
                    }}
                    data={this.props.data}
                    x="x"
                    y="y"
                    width={100}
                    containerComponent={<VictoryContainer responsive={false}/>}/>

            </VictoryChart>
        )
    }
}
