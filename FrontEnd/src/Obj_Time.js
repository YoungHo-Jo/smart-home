import React, {Component} from 'react'
import request from 'superagent'
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
import { Table } from 'semantic-ui-react'


class ObjTime extends Component {
    constructor(props){
        super(props)
        this.state={
            items: []
        }
    }

    componentWillMount(){
        request
            .get('http://localhost:3001/api/getData')
            .end((err,res)=>{
                if(err){
                    console.log(err)
                    console.log("ERROR !!")
                    return
                }
                console.log("res:" +res.body);
                this.setState({items: res.body})
            })
    }

    render(){
        const itemsHtml= this.state.items.map(e=>(
            <Table.Row>
                <Link to={'/EditForm/'+e.obj_id}><Table.Cell>{e.name}</Table.Cell></Link>
                <Table.Cell> {e.start_time}</Table.Cell>
                <Table.Cell> {e.end_time}</Table.Cell>
            </Table.Row>
        ))
        return (
            <div>
                <h1 style={styles.h1}> 기기별 예약시간 </h1>
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
const styles={
    h1: {
        color: 'black',
        fontSize: 24,
        padding:12
    }
}


export default ObjTime
