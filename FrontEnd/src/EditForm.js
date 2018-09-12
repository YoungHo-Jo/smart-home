import React from 'react'
import request from 'superagent'
import { Button, Form, Input} from 'semantic-ui-react'


class EditForm extends React.Component{
    constructor (props){
        super(props)
        const params = this.props.match.params.obj_id
        console.log(params)

        this.state={
            obj:params,
            start:'',
            end:''
        }
    }

    nameChanged (e){
        this.setState({obj: e.target.value})
    }

    startChanged (e){
        this.setState({start: e.target.value})
    }

    endChanged (e){
        this.setState({end: e.target.value})
    }

    post(e){

        console.log(this.state.start, this.state.end)
        request
            .get('http://localhost:3001/api/write')
            .query({
                obj: this.state.obj,
                start: this.state.start,
                end: this.state.end
            })
            .end((err,data)=>{
                if(err) console.log(err)
                this.setState({body:''})
                if(this.props.onPost){
                    this.props.onPost()
                }
                alert(this.state.start +"~"+ this.state.end +': 수정 완료')
            })
    }

    render() {
        return (
            <div>
                <h1> Edit Form </h1>
                <Form size='mini'>
                    Object ID: <br />
                    <Input focus placeholder={this.state.obj} onChange={e=> this.nameChanged(e)}/><br />
                        Start Time: <br />
                    <Input focus placeholder={this.state.start} type='time' onChange={e=>this.startChanged(e)}/><br />
                        END Time: <br />
                    <Input focus placeholder={this.state.end} type='time' onChange={e=>this.endChanged(e)}/><br /><br />
                        <Button.Group>
                            <Button> Cancel </Button>
                            <Button.Or />
                            <Button positive onClick={e=> this.post()} > Save </Button>
                        </Button.Group>
                </Form>
            </div>
        )
    }
}

export default EditForm
