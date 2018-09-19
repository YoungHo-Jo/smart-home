import React from 'react';
import './css/App.css';


class App extends React.Component {
  render() {
    return (
        <div className="app-body">
            <header>
                <span id="text"> Smart Home IoT</span>
            </header>
            <nav>
                    <div id="sidenav">
                        <a href="/Dashboard">Dashboard</a>
                        <a href="/ReservedStatus">Schedule</a>
                        <a href="/RemoteControl">Remote Control</a>
                        <a href="/CheckConsump">CheckConsump</a>
                        <a href="/User">User</a>
                    </div>
            </nav>
        </div>
    );
  }
}
export default App;
