import React, {Component, PropTypes} from 'react';
import {Form, Col, FormGroup, FormControl, Button, ButtonGroup} from 'react-bootstrap';
import RichTextEditor from 'react-rte';
import $ from 'jquery';
import {cleanIfUIProjectName, rebuildEncodedCSV} from './utilityFunctions';
import {processData} from './App';
import moment from 'moment';
import './failure-analysis-table.css';
import _ from 'lodash';
import LoadingIndicator from './LoadingIndicator';

export default class AnalysisHelper extends Component {	
  static propTypes = {
    onChange: PropTypes.func
  };  

  state = {
  	failureType:"",
    failureReasonRTEObject: RichTextEditor.createEmptyValue(),
    defectID: "",
    items: [],
    readyToAdd:true,
    pastAnalysisLoaded: false
  }


  onAnalysisChange = () => {
  	this.props.onAnalysisChange(this.props.row, this.state.items[0].failureType);
  }

  changeFailureReason = (value) => {
    this.setState({failureReasonRTEObject:value});
    };

  changeFailureType = (e) => {
    	this.setState({failureType:e.target.value});
    }

  changeDefectID = (e) => {
    this.setState({defectID:e.target.value});
  }

    addToDb = () =>
  {
    //alter this function to accomodate new DB columns. (of course, after adding the necessary form controls)
  	this.setState({readyToAdd:false});
 	
    $.ajax({
                url: `http://bxb-phat3-lnx:8085/analysisNote?customer=${encodeURIComponent(this.props.row.customer)}&version=${encodeURIComponent(this.props.row.version)}&project=${encodeURIComponent(cleanIfUIProjectName(this.props.row.project))}&testSuite=${encodeURIComponent(this.props.row.test_suite)}&testCase=${encodeURIComponent(this.props.row.test_case)}&reportDate=${encodeURIComponent(this.props.row.report_date)}&failureType=${encodeURIComponent(this.state.failureType)}&defectID=${encodeURIComponent(this.state.defectID)}`,
                type: 'PUT',
                dataType: 'text',
                data:this.state.failureReasonRTEObject.toString('markdown'),
                success: function (data, textStatus, xhr) {
                    let addedAnalysis = {row:this.props.row, id:data,failureType:this.state.failureType, defectID:this.state.defectID, failureReason:this.state.failureReasonRTEObject.toString('markdown')};
                    //console.log(addedAnalysis);
                    this.setState({items:[addedAnalysis].concat(this.state.items),failureType:"", defectID:"", failureReasonRTEObject: RichTextEditor.createEmptyValue(), readyToAdd:true});
                    //console.log(this.state.items);
                    this.onAnalysisChange(data);
                }.bind(this),
                error: function (xhr, textStatus, errorThrown) {
                    this.setState({readyToAdd:true});
                    alert('Unable to add to DB');                    
                }.bind(this)
            });
  }

  componentWillMount() {
  	 $.ajax({
                url: `http://bxb-phat3-lnx:8085/analysisNotes?customer=${encodeURIComponent(this.props.row.customer)}&version=${encodeURIComponent(this.props.row.version)}&project=${encodeURIComponent(cleanIfUIProjectName(this.props.row.project))}&testSuite=${encodeURIComponent(this.props.row.test_suite)}&testCase=${encodeURIComponent(this.props.row.test_case)}`,
                type: 'GET',
                dataType: 'text',                
                success: function (content) {
                	let acquiredItems = processData(content);
                	this.setState({pastAnalysisLoaded:true, items:acquiredItems.map((i)=> {return {row:this.props.row, id:i.id, timestamp:i.timestamp, failureType:i.failure_type, failureReason:rebuildEncodedCSV(i.failure_reason), defectID:i.defect_id};})}); //TODO:reformat this confusing code
                }.bind(this),
                error: function (content) {
                    alert('Unable to fetch past analyses');
                }
            });
  }

  render () {
    //console.log(this.state.items);
    return (
    	<div>
    	<h3> Add New Analysis </h3>
      <div className="panel panel-default">
              <div className="panel-heading">
              <Form horizontal>
                <FormGroup>                                                
                      <Col md={4}>
                        <FormControl componentClass="select"  onChange={this.changeFailureType} value={this.state.failureType} >
                          <option value=" ">Failure type (optional)</option>
                          <option value="PH Issue">PH Issue</option>
                          <option value="Selenium Issue">Selenium Issue</option>
                          <option value="Responsiveness Issue">Responsiveness Issue</option>
                          <option value="Script Issue">Script Issue</option>
                          <option value="Framework Issue">Framework Issue</option>
                        </FormControl>
                      </Col>
                      <Col md={4}>
                        <FormControl
                          type="text"
                          value={this.state.defectID}
                          placeholder="Defect ID (starts with DE; optional)"
                          onChange={this.changeDefectID}
                        />
                      </Col>              
              </FormGroup>
            </Form>
              </div>
              <div className="panel-body">
                <RichTextEditor
                  value={this.state.failureReasonRTEObject}
                  className="analysis-editor borderless"
                  onChange={this.changeFailureReason}
                  placeholder="Failure reason. HINT: You can also paste HTML content."
                />
              </div>
            </div>			
			    <Button type="submit" onClick={this.addToDb} bsStyle="primary" disabled={!(this.state.readyToAdd)}>
			      Submit
			    </Button>
			    <br /><br />
			    <h3>Past Analyses</h3>
			    {this.state.pastAnalysisLoaded ? this.state.items.map((i, index)=> <AnalysisNote key={index} pos={index} i={i} onAnalysisChange={this.props.onAnalysisChange} />
            ): <LoadingIndicator /> }
        </div>
    );
  }
}

class AnalysisNote extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      editable: false,    
      readyToUpdate:true,
      failureReasonRTEObject: RichTextEditor.createValueFromString(this.props.i.failureReason, 'markdown'),
      failureType: this.props.i.failureType,
      defectID: this.props.i.defectID
    };
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.i.failureReason !== nextProps.i.failureReason) this.setState({failureReasonRTEObject: RichTextEditor.createValueFromString(nextProps.i.failureReason, 'markdown')});
    if(this.props.i.failureType !== nextProps.i.failureType) this.setState({failureType: nextProps.i.failureType});
    if(this.props.i.defectID !== nextProps.i.defectID) this.setState({defectID: nextProps.i.defectID});    
  }

  updateDB = () =>
  {
    //alter this function to accomodate new DB columns. (of course, after adding the necessary form controls)
    this.setState({readyToUpdate:false});
    //console.log(this.state);
  
    $.ajax({
                url: `http://bxb-phat3-lnx:8085/analysisNote/${this.props.i.id}?failureType=${encodeURIComponent(this.state.failureType)}&defectID=${encodeURIComponent(this.state.defectID.length ? this.state.defectID: " ")}`,
                type: 'POST',
                dataType: 'text',
                data:this.state.failureReasonRTEObject.toString('markdown'),      
                success: function (data, textStatus, xhr) {
                    this.setState({readyToUpdate:true, editable:false});
                    this.onAnalysisChange();
                }.bind(this),
                error: function (xhr, textStatus, errorThrown) {
                    this.setState({readyToUpdate:true});
                    alert('Unable to add to DB');                    
                }.bind(this)
            });            
  }

  onAnalysisChange = () => {
    if(this.props.pos===0)
    this.props.onAnalysisChange(this.props.i.row, this.state.failureType);
  }

  toggleEditable = (i) => {
    this.setState({editable:!this.state.editable});
  }

  changeFailureReason = (value) => {
    this.setState({failureReasonRTEObject:value});
    };

  changeFailureType = (e) => {
      this.setState({failureType:e.target.value});
    }

  changeDefectID = (e) => {
    this.setState({defectID:e.target.value});
  }

  render()
  {
    return <div className="panel panel-default">
              <div className="panel-heading">
              <Form horizontal>
                <FormGroup>
              {
                !this.state.editable ? 
                <Col md={8}><span className="panel-title">{ this.state.failureType.length > 1 ? this.state.failureType + " " + this.state.defectID : "(analysis in progress) "  + this.state.defectID} </span><span>{" - " + moment(this.props.i.timestamp).fromNow()}</span></Col>
                :<div>                                        
                      <Col md={4}>
                        <FormControl componentClass="select"  onChange={this.changeFailureType} value={this.state.failureType} >
                          <option value=" ">Failure type (optional)</option>
                          <option value="PH Issue">PH Issue</option>
                          <option value="Selenium Issue">Selenium Issue</option>
                          <option value="Responsiveness Issue">Responsiveness Issue</option>
                          <option value="Script Issue">Script Issue</option>
                          <option value="Framework Issue">Framework Issue</option>
                        </FormControl>
                      </Col>                      
                      <Col md={4}>
                        <FormControl
                          type="text"
                          value={this.state.defectID}
                          placeholder="Defect ID (starts with DE; optional)"
                          onChange={this.changeDefectID}
                        />
                      </Col>
                    </div>
              }
              <Col md={4}>              
                <ButtonGroup className="pull-right">
                {this.state.editable ? <Button bsSize="small" bsStyle="primary" onClick={this.updateDB} disabled={!(this.state.readyToUpdate)} >Save</Button>:""}
                <Button bsSize="small" bsStyle="default" onClick={this.toggleEditable}>{this.state.editable ? "Cancel":"Edit"}</Button>
                </ButtonGroup>
                </Col>
              </FormGroup>
            </Form>                
              </div>
              <div className="panel-body">
                <RichTextEditor
                  value={this.state.failureReasonRTEObject}
                  className="analysis-editor borderless"
                  onChange={this.changeFailureReason}
                  readOnly={!this.state.editable}
                />
              </div>
            </div>

  }
}