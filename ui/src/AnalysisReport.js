import React from 'react';
import $ from 'jquery';
import {cleanIfUIProjectName, rebuildEncodedCSV} from './utilityFunctions';
import {processData} from './App';
import d3 from 'd3';
import RichTextEditor from 'react-rte';
import download from 'downloadjs';
import LoadingIndicator from './LoadingIndicator';
import {getLink} from './App';
import {Tabs, Tab, ButtonGroup, Button, FormControl} from 'react-bootstrap';
import _ from 'lodash';

//css to be exported; TODO: find another way to do this.
var tableCSS = `.flat-table {  
  overflow: auto;
  width: 100%;
  font-family: 'Open Sans', sans-serif;
}
  .flat-table th {
    background-color: #EFEFEF;
    font-weight: bold;
    padding: 0.3em 0.3em;
    text-align: center;
    border: thin solid #ddd;
  }
  .flat-table td {
    color: rgb(111, 111, 111);
    padding: 0.8em 0.6em 0.35em 0.6em;
    border: thin solid #eee;
    min-width: 80px;
  }

  .flat-table tr {
    background-color: #F7F7F7;
  }

  .flat-table tr:hover {
    background-color: #FCFCFC;
  }

  .label-success
  {
   background: #006837;
  }

  .label-danger
  {
    background: #a50026;
  }

  .label-default
  {
    background: #999;
  }

  .container-fluid {
   max-width:95%;
}
`;


export default class AnalysisReport extends React.Component{
  
  constructor(props) {
    super(props);
    this.state = { items: [], isLoaded:false, mergedTests:[], editedTestCases:[] };

      }

toggleEditable = () => this.setState({editable:!this.state.editable});


  getReportLink = (analysis) => {
    let logLink = getLink("",this.props.testsInView.find((l)=>analysis.customer === l.customer && analysis.version === l.version && analysis.test_suite === l.test_suite && analysis.test_case === l.test_case));
    if(logLink.endsWith('Report.html'))
      return <a target="_blank" href={`${logLink.substring(0,logLink.lastIndexOf('/'))}/test_reports/${analysis.test_case}`}>{analysis.test_case}</a>;
    else return <a target="_blank" href={`${logLink.substring(0,logLink.lastIndexOf('/log'))}`}>{analysis.test_case}</a>

  }

  mergeTestsWithFailureTypes = () => {
    if(this.state.isLoaded) {  

      let filteredItems = this.props.testsInView.filter((i)=>i.status === "FAIL" || i.status === 'Failure');
      let testsWithFailureType = filteredItems.map((i)=> {i['failure_type'] = this.getFailureTypeValue(i); i['failure_reason'] = this.getFailureReasonValue(i); return i });
      this.setState({mergedTests:testsWithFailureType});
    }

    else alert('ERROR: Analysis data not loaded');
  }

  addToEditedList = (test_case) => {
    

    console.log(test_case+ " has been edited");    
  
}

 getFailureTypeValue = (row) => {
  let res = _.filter(this.state.items,{customer:row.customer, version:row.version, test_suite:row.test_suite, test_case:row.test_case});
  //console.log(analysisNotes);
  //console.log(res);
  return res.length ? res[0]['failure_type']==='null' ? "(analysis in progress)" : res[0]['failure_type'] : "";
  }

  
  getFailureReasonValue = (row) => {
  let res = _.filter(this.state.items,{customer:row.customer, version:row.version, test_suite:row.test_suite, test_case:row.test_case});
  //console.log(analysisNotes);
  //console.log(res);
  return res.length ? res[0]['id']==='null' ? "" : res[0]['id'] : "";
  }


  getFailureReasonValue = (row) => {
  let res = _.filter(this.state.items,{customer:row.customer, version:row.version, test_suite:row.test_suite, test_case:row.test_case});
  //console.log(analysisNotes);
  //console.log(res);
  return res.length ? res[0]['failure_reason']==='null' ? "" : res[0]['failure_reason'] : "";
  }

  componentWillMount() {
    $.ajax({
                url: 'http://bxb-phat3-lnx:8085/analysisDataForReport',
                type: 'GET',
                dataType: 'text',
                success: function (data) {
                  let unfilteredItems = processData(data);
                  let filteredItems = unfilteredItems.filter((i)=>
                    {
                      let res = this.props.testsInView.find((j)=>i.customer === j.customer && i.version === j.version && i.test_suite === j.test_suite && i.test_case === j.test_case);
                      return res ? res.status === "FAIL" || res.status === 'Failure' : false;
                      }
                       )                  
                  this.setState({items:filteredItems, isLoaded:true});
                  this.mergeTestsWithFailureTypes();
                }.bind(this),
                error: function (data) {
                    alert('ERROR: ');
                }
            });
  }

  toHTML = () => {   
    download(`<style>${tableCSS}</style>` + $('#all-tables').html(),'failure-analysis.html', "text/html");
  }

  render() {
    if(this.state.isLoaded)
    {
      let result = this.state.mergedTests.length ? d3.nest()
        .key(function(d) { return d.customer+"-"+d.version })
        .key(function(d) { if(d.project.startsWith("Regression")) return "UI-Regression"; else if(d.project.startsWith("Sanity")) return "UI-Sanity"; else return d.project; })
        .entries(this.state.mergedTests)
      : [];

    return  result.length ?
    <Tabs defaultActiveKey={this.props.activeTab ? this.props.activeTab : 1} id="test-case-details-tabs">
              <Tab eventKey={1} title="Format 1">
              <div>
              <br />
              <input type="button" onClick={this.toHTML} value="Export to HTML" />

            
            <ButtonGroup className="pull-center">
       
            {this.state.editable ? <Button bsSize="small" bsStyle="primary" onClick={this} disabled={!(this.state.Save)}>Save</Button>:""}
          <Button bsSize="small" bsStyle="default" onClick={this.toggleEditable}>{this.state.editable ? "Cancel":"Add/Edit"}</Button>
       
        </ButtonGroup>

              
                  <div id="all-tables">    
                  {
                  result.map((deployment,i)=>
                              <div key={i}>
                              <br />
                                <h4>{deployment.key}</h4>
                                  {deployment.values.map((project,j)=>
                                    <div key={j}><br />
                                    <table className="flat-table" id={"testTable"+i}>
                                    

                                    <thead>
                                      <tr><th colSpan="4">{deployment.key + " " + project.key}</th></tr>
                                      
                                      <tr><th width="15%">sno</th><th width="30%">Test Case</th><th width="20%">Failure Type</th><th width="40%">Failure Reason</th></tr>
                                    </thead>
                                    <tbody>

                                        
                                      {

                                         project.values.map((analysis,k)=><AnalysisReportEditableRow onEdit={this.addToEditedList} reportLink={this.getReportLink(analysis)} editable={this.state.editable} save={k} key={k} sno={k+1} analysis={analysis}/>)
                                        }

                                          
                                           


                                    </tbody>
                                    </table>
                                    </div>
                                          
                                  )}                    
                              </div>  
                    )
                  }
                  </div>
                </div>
              </Tab>              
            </Tabs>    
    : <h3> No data found for current selection </h3>;
  }

  else return <LoadingIndicator />;

    }
    
}


class AnalysisReportEditableRow extends React.Component {

  //this.props.analysis.failure_reason

  constructor(props) {
    super(props);
    this.temp = this.props.analysis.failure_reason;
     console.log(this.props.analysis.failure_reason);
    if(this.props.analysis.failure_reason.length>0)
    {

      this.temp = this.props.analysis.failure_reason;

    }
    else
    {
      this.temp="Problem statement \n"+"analysis\n"+"workaround\n";
    }
    this.state = {
                  editable:false,
                  failureType:this.props.analysis.failure_type,
                  failureReasonRTEObject: RichTextEditor.createValueFromString(rebuildEncodedCSV(this.temp), 'markdown'),
                  readyToSave:true
                };
  }

  toggleEditable = () => this.setState({editable:!this.state.editable});

  changeFailureType = (e) => {
      this.setState({failureType:e.target.value});
    }

  changeFailureReason = (value) => {
    this.props.onEdit(this.props.analysis.test_case);
    this.setState({failureReasonRTEObject:value});
    };

  addToDb = () =>
  {
    //alter this function to accomodate new DB columns. (of course, after adding the necessary form controls)
    this.setState({readyToSave:false});    
  
    $.ajax({
                url: `http://bxb-phat3-lnx:8085/analysisNote?customer=${encodeURIComponent(this.props.analysis.customer)}&version=${encodeURIComponent(this.props.analysis.version)}&project=${encodeURIComponent(cleanIfUIProjectName(this.props.analysis.project))}&testSuite=${encodeURIComponent(this.props.analysis.test_suite)}&testCase=${encodeURIComponent(this.props.analysis.test_case)}&reportDate=${encodeURIComponent(this.props.analysis.report_date)}&failureType=${encodeURIComponent(this.state.failureType)}`,
                type: 'PUT',
                dataType: 'text',
                data:this.state.failureReasonRTEObject.toString('markdown'),
                success: function (data, textStatus, xhr) {
                  this.toggleEditable();
                }.bind(this),
                error: function (xhr, textStatus, errorThrown) {
                    this.setState({readyToSave:true});
                    alert('Unable to add to DB');                    
                }.bind(this)
            });
  }

  render = () => {
  return (<tr key={this.props.k}>
        <td>{this.props.sno}</td>
        <td>{this.props.reportLink}</td>

      <td>
      {
        this.state.editable ? <FormControl componentClass="select"  onChange={this.changeFailureType} value={this.state.failureType} >
                                <option value=" ">Failure type (optional)</option>
                                <option value="PH Issue">PH Issue</option>
                                <option value="Selenium Issue">Selenium Issue</option>
                                <option value="Responsiveness Issue">Responsiveness Issue</option>
                                <option value="Script Issue">Script Issue</option>
                                <option value="Framework Issue">Framework Issue</option>
                              </FormControl>
        : this.state.failureType
      }
      </td>
      


       
      <td><RichTextEditor 
                value={this.state.failureReasonRTEObject}
                className="analysis-editor borderless"              
                readOnly={!this.props.editable}
                onChange={this.changeFailureReason}

                
              />
      </td>

      </tr>)


  }

}
  
/*

<td className="someWiderColumn">
        <ButtonGroup className="pull-right">
          {this.state.editable ? <Button bsSize="small" bsStyle="primary" onClick={this.addToDb} disabled={!(this.state.readyToSave)}>Save</Button>:""}
          <Button bsSize="small" bsStyle="default" onClick={this.toggleEditable}>{this.state.editable ? "Cancel":"Add/Edit"}</Button>
        </ButtonGroup>
      </td>

      */


/*

<table>
<tr><td>project</td></tr>
<tr><td>testcase</td><td>failure type</td><td>failure reasson</td></tr>
</table>

*/

 
 