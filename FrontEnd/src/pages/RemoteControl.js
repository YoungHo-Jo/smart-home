import React from 'react'

import '../css/App.css'
import '../css/component.css'
import PlanBtn from '../component/PlanBtn'
import StatusTable from '../component/StatusTable'

export default class RemoteControl extends React.Component{
    render(){
        return (
            <main>
                <div id='plan-btn'>
                    <PlanBtn/>
                </div>
                <div className='box2-wrapper'>
                    <div className='box2-50' >
                        <StatusTable id='StatusTable' status={'ON'}/>
                    </div>
                    <div className='box2-50'>
                        <StatusTable status={'OFF'}/>
                    </div>
                </div>
            </main>
        )
    }
}

