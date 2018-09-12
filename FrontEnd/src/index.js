import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import 'semantic-ui-css/semantic.min.css';


import Monitoring from "./Monitoring";
import App from "./App"
import ObjTime from "./Obj_Time";
import EditForm from "./EditForm";
import Consumption from "./Consumption"
import calendar from "./calendar"




ReactDOM.render(
    <Router>
        <div>
            <Route path="/" component={App}/>
            <Route path="/EditForm/:obj_id" component={EditForm}/>
            <Route path="/ObjTime" component={ObjTime} />
            <Route path="/Monitoring" component={Monitoring}/>
            <Route path="/Consumption" component={Consumption}/>
            <Route path="/calendar" component={calendar}/>
        </div>
    </Router>,
    document.getElementById('root')
);
