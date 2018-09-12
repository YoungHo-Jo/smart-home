import React, {Component} from 'react'
import request from 'superagent'
import { Table } from 'semantic-ui-react'


class Monitoring extends Component{
    constructor(props){
        super(props)
        this.state={
            items:[],
            OnOff: 'On'
        }
    }

    componentWillMount(){
        request
            .get('http://localhost:3001/api/Monitoring')
            .end((err,res)=>{
                if(err){
                    console.log(err)
                    return
                }
                console.log("res:" +res.body);
                this.setState({items: res.body})
            })
    }

    OnOffChange(e){
        if(this.state.OnOff==='On')
            this.setState({OnOff: 'Off'})
        else
            this.setState({OnOff: 'On'})
    }


    render(){
        const itemsHtml= this.state.items.map(e=>(
            <Table.Row>
                <Table.Cell> {e.name} </Table.Cell>
                <Table.Cell> {e.start_time}</Table.Cell>
                <Table.Cell> {e.end_time}</Table.Cell>
                <Table.Cell> <button onClick={e=> this.OnOffChange(e)}> {this.state.OnOff} </button></Table.Cell>
            </Table.Row>
        ))
        return (
            <div>
                <tr><td colSpan="2"><h2> 현재 동작되는 기기들</h2></td></tr><br />
                <Table striped>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Object</Table.HeaderCell>
                            <Table.HeaderCell>Start</Table.HeaderCell>
                            <Table.HeaderCell>End</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {itemsHtml}
                    </Table.Body>
                </Table>
            </div>
        )
    }
}

export default Monitoring

