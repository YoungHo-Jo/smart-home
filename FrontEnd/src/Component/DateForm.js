import React from 'react'

class DateForm extends React.Component{
    constructor(props) {
        super(props)
    }
        state= {
            from: 'from',
            to: 'to'
        }

    render(){
        return (
            <div>
                <form style={styles.form}>
                    <input id='from' value={this.props.from} style={styles.input}/>
                    <input id='to' value={this.props.to} style={styles.input}/>
                </form>
            </div>
        )
    }
}

export default DateForm

const styles={
    form: {
        'background-color': '#3CBCC8D',
        'width':'100%',
        'overflow':'auto',
        'margin':'1% 17%'
    },

    input: {
        'type':'date',
        'width':'30%',
        'padding':'2px 20px',
        'border':'1px solid black',
        'margin':'5px',
        'text-align':'center'
    }
}
