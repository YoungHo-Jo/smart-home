import React, {Component} from 'react'
import request from 'superagent'
import ReservedTable from '../component/ReservedTable'

class ReservedPlug extends Component{
    state={
        time:[],
        plugs:[],
        url: 'http://localhost:3001/api/getData',
        i:0
    }

    componentWillMount(){ // 이게될까?
            request
                .get(this.state.url)
                .end((err, res) => {
                    if (err) {
                        console.log("Error:", err)
                        return
                    }
                    console.log("response: res.body");
                    this.state.i === 0
                        ? this.setState({time: res.body})
                        : this.setState({plugs:res.body})
                })
    }

    render(){
        return(
            <main>

                <div class="table-setting">
                    Plug-Time
                    <ReservedTable data={this.state.time}/>
                </div>

                <div className="table-setting">
                    Time-Plug
                    <ReservedTable data={this.state.time}/>
                </div>
            </main>
        )
    }

}


export default ReservedPlug
