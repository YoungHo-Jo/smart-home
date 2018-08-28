import React, {Component} from 'react'
import './App.css'
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
import profile from './profile.png'


import Monitoring from "./Component/Monitoring";
import ObjTime from "./Component/Obj_Time";
import EditForm from "./Component/EditForm";
import calendar from "./Component/calendar"


class App extends Component {
  render(){
      return (
          <div>
              <div className="header">
                  Ho
                  <i className="plug icon"></i>
              </div>
              <div className="menu">
                  <h1> Smart Home IoT</h1>
                  <img src={profile} alt="profile" width='100%'/>
                  <div className="sidenav">
                      <a className="activate" href="./">Home</a>
                      <a href="./ObjTime"> Reserved Objects</a>
                      <a href="./Monitoring"> Current Status</a>
                      <a href="./checkpage"> Power Consumption</a>
                  </div>
              </div>
          </div>
      )
  }
}
export default App
