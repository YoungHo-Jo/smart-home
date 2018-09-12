import React, {Component} from 'react'
import './App.css'
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'


import Monitoring from "./Monitoring";
import ObjTime from "./Obj_Time";
import EditForm from "./EditForm";
import calendar from "./calendar"


class App extends Component {
  render(){
      return (
          <div>
          <h2 className="ui header">
              <i className="plug icon"></i>
              <div className="content">
                  HomeIoT  Testing
              </div>
          </h2>
              <div className="ui three item menu">
                  <a className="active item" href="./ObjTime">Reserved Objects</a>
                  <a className="item" href="./Monitoring">Current Status</a>
                  <a className="item" href="./calendar">Power Consumption</a>
              </div>
              <br />
              <br />
              <br />
          </div>
      )
  }
}
export default App
