import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';
import Dashboard from './pages/Dashboard'
import ReservedPlug from './pages/ReservedPlug'
import CheckConsump from './pages/CheckConsump'
import RemoteControl from './pages/RemoteControl'
import 'bootstrap/dist/css/bootstrap.min.css';

//import 'semantic-ui-css/semantic.min.css';

import {BrowserRouter as Router, Route} from 'react-router-dom'


ReactDOM.render(
    <Router>
        <div>
            <Route path="/" component={App}/>
            <Route path="/Dashboard" component={Dashboard}/>
            <Route path="/ReservedStatus" component={ReservedPlug}/>
            <Route path="/CheckConsump" component={CheckConsump}/>
            <Route path="/RemoteControl" component={RemoteControl}/>

            />

        </div>
    </Router>,
    document.getElementById('root')
);

//<Route path="/test" component={test}
