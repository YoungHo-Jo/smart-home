import React from 'react';
import { Table } from 'reactstrap';

export default class StatusTable extends React.Component {

    onclick=(e)=>{
        e.target.status==='on'
            ? window.alert('plug is off')
            : window.alert('plug is on')
    }

    render() {
        return (
            <Table hover id='StatusTable'>
                <thead>
                <tr>
                    <th>#</th>
                    <th>PLUG</th>
                    <th>START</th>
                    <th>STATUS</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <th scope="row">1</th>
                    <td>PLUG2</td>
                    <td>14:30:00</td>
                    <td><button className={'onoff-btn'}> {this.props.status} </button></td>
                </tr>
                <tr>
                    <th scope="row">2</th>
                    <td>PLUG1</td>
                    <td>16:17:00</td>
                    <td><button className={'onoff-btn'}> {this.props.status} </button></td>
                </tr>
                <tr>
                    <th scope="row">3</th>
                    <td>PLUG3</td>
                    <td>14:57:00</td>
                    <td><button className={'onoff-btn'}> {this.props.status} </button></td>
                </tr>
                </tbody>

            </Table>
        );
    }
}
