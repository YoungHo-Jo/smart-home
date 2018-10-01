import React from 'react';
import { Table } from 'reactstrap';

export default class ReservedTable extends React.Component {
    constructor(props){
        super(props)
    }

    render() {
        const items=this.props.data.map(value=>(
            <tr>
                <td>{value.plug}</td>
                <td>{value.start}</td>
                <td>{value.end}</td>
            </tr>

        ))
        return (
            <Table hover>
                <thead>
                <tr>
                    <th>PLUG</th>
                    <th>START</th>
                    <th>END</th>
                </tr>
                </thead>
                <tbody>
                    {items}
                </tbody>
            </Table>
        );
    }
}
