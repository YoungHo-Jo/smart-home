import React, {Component} from 'react'
import request from 'superagent'
import ReservedTable from '../component/ReservedTable'

class ReservedPlug extends Component{
    state={
        time:[],
        plugs:[],
        i:0
    }

    componentDidMount(){
            request
                .get('http://localhost:3001/scheduling_test')
                .end((err,res)=>{
                    if (err) console.log(err);
                    this.setState({
                        plugs:res.body[0].plug,
                        time:res.body[0].time,
                    });
                })
    }

    render(){

        console.log('time'+JSON.stringify(this.state.time));
        console.log('plugs'+JSON.stringify(this.state.plugs));

        return(
            <main>
                <div style={{display:'flex'}}>
                    <div className="table-w">
                        <p style={table_text}>Plug-Time</p>
                        <div className="table-setting">
                            <ReservedTable data={this.state.plugs}/>
                        </div>
                    </div>
                    <div className="table-w">
                        <p style={table_text}>Time-Plug</p>
                        <div className="table-setting">
                            <ReservedTable data={this.state.time}/>
                        </div>
                    </div>
                </div>
            </main>
        )
    }
}

const table_text={
    color:'white',
    position:'relative',
    top:'20px',
    left:'10%',
    fontSize: 'x-large',
}


export default ReservedPlug;
