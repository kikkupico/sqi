import React from 'react';
import jQuery from 'jquery';
import $ from 'jquery';
import {Grid, Row, Col} from 'react-bootstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
//import tests from './App'

jQuery.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

function processData(allText)
  {
      var allTextLines = allText.split(/\r\n|\n/);
      var headers = allTextLines[0].split(',');
      headers.unshift('sno');
      var returnedArray = [];
      //console.log(headers);

      for (var i=1; i<allTextLines.length; i++) {
          var data = allTextLines[i].split(',');
          if (data.length === headers.length-1) { //checking for header.lenght-1 as sno is now added to headers

              var tarr = {};
              tarr['sno']=JSON.stringify(i);
              for (var j=1; j<headers.length; j++) {
                  tarr[headers[j]]=data[j-1];
              }
              returnedArray.push(tarr);
          }
      }
      //console.log(JSON.stringify(tests));
      return returnedArray;
  }

export default class TestCaseRanParallel extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      content: ""
    };
    //this.getContent = this.getContent.bind(this);
  }

  componentDidMount()
  {
    var _this = this;
    //console.log("loading test case edit history...");
    var row = this.props.row;
    //console.log(row);
    //console.log(row.start_time)
    //console.log(row.end_time)
    //var project = (row.project.startsWith('Sanity') || row.project.startsWith('Regression')) ? row.project.substring(0, row.project.indexOf('-')) : row.project;
    //var testCase = (project.startsWith('Regression')) ? this.props.testCase.replace(this.props.testSuite+"_","") : this.props.testCase;

    $.ajax({
        type: "GET",
        url: "http://bxb-phat3-lnx:8085/parallelScripts/"+row.customer+'/'+row.version+'/'+row.start_time+'/'+row.end_time,
        dataType: "text",
        success: function(response)
        {
          var extractedData=processData(response);
          this.setState({content:extractedData});
          //console.log(extractedData);
        }.bind(this)
      });
  }

  render() {
    if(this.state.content === "") return <h3> Loading Parallel Test cases </h3>
    else {
      //var gitOutputLines = this.state.content.split('\n');
      return (
        <div>
        <Grid className="parallel-table-container">
          <Row>
            <Col md={4} className="left-align"><h5>No of Test cases Ran Parallel : {this.state.content.length}</h5></Col>
            </Row>
          <Row>
          <Col md={12}>
          <BootstrapTable bordered={ false }
          tableStyle={ { border: 'none' } }
            containerStyle={ { border: 'none' } }
            headerStyle={ { border: 'none' } }
            bodyStyle={ { border: 'none' } }
            trClassName="details-table-row"
          ref='table' data={ this.state.content } pagination={true}>
            <TableHeaderColumn className="details-table-header-column" width='50' editable={ false } ref='sno' dataField='sno' hidden isKey={true} >SNo</TableHeaderColumn>
          <TableHeaderColumn className="details-table-header-column" width='100' dataSort={ true } editable={ false } ref='project' dataField='project' >Project</TableHeaderColumn>
            <TableHeaderColumn className="details-table-header-column" width='150' dataSort={ true } editable={ false } ref='test_suite' dataField='test_suite' >Test Suite</TableHeaderColumn>
            <TableHeaderColumn className="details-table-header-column" width='250' dataSort={ true } editable={ false } ref='test_case' dataField='test_case' >Test Case</TableHeaderColumn>
            <TableHeaderColumn className="details-table-header-column" width='60' dataSort={ true } editable={ false } ref='status'  dataField='status' >Status</TableHeaderColumn>
            <TableHeaderColumn className="details-table-header-column" width='110' dataSort={ true } editable={ false } ref='start_time' dataField='start_time'>Start Time</TableHeaderColumn>
            <TableHeaderColumn className="details-table-header-column" width='110' dataSort={ true } editable={ false } ref='end_time'  dataField='end_time' >End Time</TableHeaderColumn>
          </BootstrapTable>
          </Col>
          </Row>
        </Grid>
        </div>
        //<div dangerouslySetInnerHTML={{ __html: this.state.content }} />
      );
    }

  }
}
