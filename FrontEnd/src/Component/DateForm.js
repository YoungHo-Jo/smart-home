import React from 'react'
import {Button, Form } from 'semantic-ui-react'

const DateForm = () => (
        <form style={styles.form}>
            <input id='from' value='from' style={styles.input}/>
            <input id='to' value='to'style={styles.input}/>
        </form>
)

export default DateForm

const styles={
    form: {
        'background-color': '#3CBCC8D',
        'width':'100%',
        'overflow':'auto',
        'text-align':'center'
    },

    input: {
        'type':'date',
        'width':'30%',
        'padding':'12px 20px',
        'border':'none',
        'margin':'15px',
        'text-align':'center'
    }
}
