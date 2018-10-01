import React from 'react';
import { Table } from 'reactstrap';

export default class CheckTable extends React.Component {
    render() {
        return (
            <Table hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Plug</th>
                    <th>Hours</th>
                    <th>Consumption</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <th scope="row">1</th>
                    <td>Plug3</td>
                    <td>67</td>
                    <td>60.4 kWh</td>
                </tr>
                <tr>
                    <th scope="row">2</th>
                    <td>Plug2</td>
                    <td>90</td>
                    <td>24.3 kWh</td>
                </tr>
                <tr>
                    <th scope="row">3</th>
                    <td>Plug1</td>
                    <td>480</td>
                    <td>27 kWh</td>
                </tr>
                </tbody>
            </Table>
        );
    }
}
