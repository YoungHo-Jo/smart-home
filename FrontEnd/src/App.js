import React, {Component} from 'react'
import './css/App.css'
import profile from './profile.png'


class App extends Component {
  render(){
      return (
          <div>
              <div className="header">
                  Smart Home IoT Testing
                  <i className="plug icon"></i>
              </div>
              <div className="menu">
                  <h1> Smart Home IoT</h1>
                  <img src={profile} alt="profile" width='100%'/>
                  <div className="sidenav">
                      <a href="/Home">Home</a>
                      <a href="/ObjTime"> Reserved Objects</a>
                      <a href="/Monitoring"> Current    Status</a>
                      <a href="/checkpage"> Power Consumption</a>
                  </div>
              </div>
          </div>
      )
  }
}
export default App
//                      <a className="activate" href="./Home">Home</a>
