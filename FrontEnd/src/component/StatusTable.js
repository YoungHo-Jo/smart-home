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
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Username</th>
                    <th>test</th>
                    <th>testing</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <th scope="row">1</th>
                    <td>Mark</td>
                    <td>Otto</td>
                    <td>@mdo</td>
                    <td>@mdo</td>
                    <td><button> {this.props.status} </button></td>

                </tr>
                <tr>
                    <th scope="row">2</th>
                    <td>Jacob</td>
                    <td>Thornton</td>
                    <td>@fat</td>
                    <td>@mdo</td>
                    <td><button> {this.props.status} </button></td>
                </tr>
                <tr>
                    <th scope="row">3</th>
                    <td>Larry</td>
                    <td>the Bird</td>
                    <td>@twitter</td>
                    <td>@mdo</td>
                    <td><button> {this.props.status} </button></td>
                </tr>
                </tbody>

            </Table>
        );
    }
}
