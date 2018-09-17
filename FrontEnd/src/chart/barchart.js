import React from 'react'
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme,VictoryContainer } from 'victory'

const data= [{"name":"Airconditioner","comsump":2.64},{"name":"Refrigerator","comsump":0.97},{"name":"Television","comsump":0.7},{"name":"HairDrier","comsump":0.23},{"name":"Computer","comsump":0.43},{"name":"Charger","comsump":0.12}]

class Barchart extends React.Component {
    constructor(props){
        super(props)
    }

    render() {
        return (
            <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={20}
                scale={{x:"linear", y:"linear"}}
                width={700}
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
                        ,data: {opacity:0.7, fill:"black", stroke:"black", strokeWidth:1 }}}
                    data={this.props.data}
                    x="name"
                    y="comsump"
                    width={100}
                    containerComponent={<VictoryContainer responsive={false}/>}/>

            </VictoryChart>
        )
    }
}

export default Barchart
