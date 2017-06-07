import React from 'react';
import moment from 'moment';
import {Form, Button, FormControl, InputGroup} from 'react-bootstrap';
import $ from 'jquery';

export default class EditableList extends React.Component{

  constructor(props) {
    super(props);
    this.state = { items: this.props.initialItems ? this.props.initialItems : [] , addedText:"", readyToAdd:true };
    this.clickFunction = this.clickFunction.bind(this);
    this.updateTimeStamp = this.updateTimeStamp.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addToDb = this.addToDb.bind(this);
  }

  componentWilMount() {
    //setTimeout(()=> this.updateTimeStamp(), 120000); //NOT WORKING: TODO a working version
  }

  updateTimeStamp()
  {
    //this.setState({timestamp: Date.now()}); //NOT WORKING: TODO a working version

  }

  handleChange(e) {
    this.setState({ addedText: e.target.value });
  }

  addToDb()
  {
    $.ajax({
                url: 'http://bxb-phat3-lnx:8085/analysisNote?testCase=' + encodeURIComponent(this.props.testCase) + '&title=Analysis Hint&description=' + encodeURIComponent(this.state.addedText),
                type: 'PUT',
                dataType: 'text',
                success: function (data, textStatus, xhr) {
                    this.setState({items:[{description:this.state.addedText, timestamp:Date.now()}].concat(this.state.items),addedText:"", readyToAdd:true});
                }.bind(this),
                error: function (xhr, textStatus, errorThrown) {
                    this.setState({readyToAdd:true});
                    alert('Unable to add to DB');                    
                }.bind(this)
            });

    //setTimeout(()=>this.setState({items:[{description:this.state.addedText, timestamp:Date.now()}].concat(this.state.items),addedText:"", readyToAdd:true}), 1000)
  }

  clickFunction()
  {
    /*if (this.props.onClickFunction && typeof(this.props.onClickFunction) === "function")
    this.props.onClickFunction(this.props.logLink, this.props.date);*/
    this.setState({readyToAdd:false});
    this.addToDb();    
  }

  render() {
    return ( 
    <div>     
      <Form inline>
      <InputGroup>        
        <FormControl type="text" value={this.state.addedText}  onChange={this.handleChange}/>
        <InputGroup.Button>
          <Button onClick={this.clickFunction} disabled={!this.state.readyToAdd} > { this.state.readyToAdd ? "Add":"...adding" }</Button>
        </InputGroup.Button>
      </InputGroup>
      </Form>
      <ul> { this.state.items.map( (x,i) => <li key={i}>{x.description} ({moment(x.timestamp).fromNow()})</li>)} </ul>      
      </div>
    )
  }
}
