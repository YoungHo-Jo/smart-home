import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import 'semantic-ui-css/semantic.min.css';


import Monitoring from "./Component/Monitoring";
import App from "./App"
import ObjTime from "./Component/Obj_Time";
import EditForm from "./Component/EditForm";
import checkpage from "./checkpage";
import Home from "./Home"
import schedule from './Component/schedule'


ReactDOM.render(
    <Router>
        <div>
            <Route path="/" component={App}/>
            <Route path="/Home" component={Home}/>
            <Route path="/EditForm/:obj_id" component={EditForm}/>
            <Route path="/ObjTime" component={ObjTime} />
            <Route path="/Monitoring" component={Monitoring}/>
            <Route path="/checkpage" component={checkpage}/>
            <Route path="/schedule" component={schedule}/>

        </div>
    </Router>,
    document.getElementById('root')
);
