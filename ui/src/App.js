/* eslint max-len: 0 */
import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import $ from "jquery";
import moment from 'moment';
import _ from 'lodash';
import {Grid, Row, Col, Button, ButtonGroup, Glyphicon, Modal} from 'react-bootstrap';
import {Affix} from 'react-overlays';
import TestCasePopUpLauncherButton from './TestCasePopUpLauncherButton';
import TrendUnit from './TrendUnit';
import TrendUnitInTable from './TrendUnitInTable';
import DashCard from './DashCard';
import {getCustomFilter, trendType} from './SelectFilterRegex';
import DatePicker from 'react-datepicker';
import DatePickerWithDisplay from './DatePickerWithDisplay';
import 'react-datepicker/dist/react-datepicker.css';
import Dropdown from 'react-dropdown';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import AnalysisReport from './AnalysisReport';
import d3 from 'd3';
import LoadingIndicator from './LoadingIndicator';
//import EditableList from './EditableList';

var lastNightlyLinks = [];
var overallTrends = [];
export var deploymentData = [];
var analysisNotes = [];

const GROUPING_OPTIONS = ['None', 'Donut Chart, Histogram']

function translateProjectNameToDBName(project, customer)
{
  //workaround for UI
  //console.log(project);
  if(project.startsWith('Sanity')) return 'UI-Sanity';
  else if(project.startsWith('Regression')) return 'UI-Regression';
  else    
  return project;
}


function translateDBNameToProjectName(project, customer)
{
  if(project === 'UI-Regression') return '^Regression-';
  if(project === 'UI-Sanity') return '^Sanity-';
  return project + '$';
}

export function processData(allText) {
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

export var requiredDates = _.rangeRight(10)
                    .map(i=>moment().subtract(i, 'days').format('YYYY-MM-DD'));

export var requiredDates50 = _.rangeRight(50)
                    .map(i=>moment().subtract(i, 'days').format('YYYY-MM-DD'));

export var currentDate = moment().format('YYYY-MM-DD');
//console.log(currentDate);

export function trendFormatter(cell, row, type, clickFunction, chosenDate, onAnalysisChange) {
  var statuses = cell.split(';');
  var actualDates = row.trend_dates.split(';');
  var statusesAndDates = _.zipObject(actualDates, statuses);
  //console.log(JSON.stringify(statusesAndDates));

  return <span>{requiredDates.map(function(loopDate)
  {
    var cssClass = '';
    var statusForDate = statusesAndDates[loopDate];
    var isCurrentClass = '';

    if(statusForDate)
    {
      if(statusForDate.indexOf('Success') > -1 || statusForDate.indexOf('PASS') > -1 ) cssClass = 'success-icon';
      else if(statusForDate.indexOf('Failure') > -1  || statusForDate.indexOf('FAIL') > -1) cssClass = 'failure-icon';
    }

    if(chosenDate) {if(loopDate.indexOf(chosenDate) > -1) isCurrentClass = 'current-icon';}

    else {if(loopDate.indexOf(currentDate) > -1) isCurrentClass = 'current-icon';}

    if(type==='embedded')
    return <TrendUnit name={row.test_case} logLink={getLink(cell, row, loopDate)} testSuite={row.test_suite} testCase={row.test_case} onClickFunction={clickFunction}
              project={row.project} requiredDates={requiredDates} trend={row.trend} trendDates={row.trend_dates} statusIcon={cssClass} currentnessIcon={isCurrentClass} date={loopDate} key={loopDate} />
    else return <TrendUnitInTable onAnalysisChange={onAnalysisChange} row={row} cell={cell} name={row.test_case} logLink={getLink(cell, row, loopDate)} testSuite={row.test_suite} testCase={row.test_case}
              project={row.project} startTime={row.start_time} endTime={row.end_time} requiredDates={requiredDates} trend={row.trend} trendDates={row.trend_dates} statusIcon={cssClass} currentnessIcon={isCurrentClass} date={loopDate} key={loopDate} />
  })}</span>
}


export function getLink(cell, row, date) {
  var correctedVersion = row.version;

  //workaround for master version change
  correctedVersion = (correctedVersion==="v6.5.1" && (row.customer === 'Master' || row.customer === 'Master-Pg')) ? "v6.6.0" : correctedVersion;
  //console.log(`Project: ${row.project}; Customer: ${row.customer}; Version: ${correctedVersion} DB-Name: ${translateProjectNameToDBName(row.project)}`);
  var link = '404';
  var logDate = date ? moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
  //var project = row.project.startsWith('Regression') || row.project.startsWith('Sanity') ? row.project.substring(0,row.project.indexOf('-')) : row.project;
  var linkElement = _.find(lastNightlyLinks,
    {execution_date:logDate, customer:row.customer, version:correctedVersion , project:translateProjectNameToDBName(row.project, row.customer)});

  if(linkElement) link = linkElement['report_link'];
  return link;
}


function getProjectTrendBig(customer, version, project, trendType) {
  var correctedVersion = version==="6.5.1.0" ? "v6.5.1" : version;
  var trend = [];
  var currentDate = moment().format('YYYY-MM-DD');
  var trendElement = _.find(overallTrends,
    {execution_date:currentDate, customer:customer, version:correctedVersion , project:project});

  if(trendElement) {
    var counts = trendElement[trendType].split(';');
    var actualDates = trendElement['trend_dates'].split(';');
    var countsAndDates = _.zipObject(actualDates, counts);

    //console.log(JSON.stringify(countsAndDates));

    requiredDates50.map(function(loopDate)
    {
      var countForDate = countsAndDates[loopDate];
      if(countForDate)
      {
        trend.push(countForDate);
      }
      else {
        trend.push(0);
      }
      return 1;
    });
  }
  return trend;
}


export default class PHATAnalytics extends React.Component {

  getFailureType = (cell, row) => {
  let res = _.filter(this.state.failureTypes,{customer:row.customer, version:row.version, test_suite:row.test_suite, test_case:row.test_case});
  //console.log(analysisNotes);
  //console.log(res);
  return <TestCasePopUpLauncherButton onAnalysisChange={this.setAnalysisType} activeTab={6} name={res.length ? res[0]['failure_type']==='null' || res[0]['failure_type']===' ' ? "(analysis in progress)" : res[0]['failure_type'] : "Add New"} date={row.report_date} row={row} cell={row.trend} logLink={getLink(cell, row, currentDate)} project={row.project} testSuite={row.test_suite} testCase={row.test_case} />
  }

  linkLoader = (cell, row) => {
  //console.log(lastNightlyLinks);
  //return `<a href="${link}">${row.test_case}</a>`
  var currentDate = moment().format('YYYY-MM-DD');
  //console.log(trendFormatter(cell, row));
  return <TestCasePopUpLauncherButton onAnalysisChange={this.setAnalysisType} date={row.report_date} row={row} cell={row.trend} name={row.test_case} logLink={getLink(cell, row, currentDate)} project={row.project} testSuite={row.test_suite} testCase={row.test_case} >            
        </TestCasePopUpLauncherButton>
  }

  trendFormatterRelay = (cell, row) => trendFormatter(cell, row, "" ,"", "", this.setAnalysisType);

  getFailureTypeValueOnly = (row) => {
  let res = _.filter(this.state.failureTypes,{customer:row.customer, version:row.version, test_suite:row.test_suite, test_case:row.test_case});
  //console.log(analysisNotes);
  //console.log(res);
  return res.length ? res[0]['failure_type']==='null' ? "(analysis in progress)" : res[0]['failure_type'] : "";
  }

  setAnalysisType(row, type) {
    let newFailureTypes = this.state.failureTypes;
    let newTests = this.state.tests;
    let editedItemIndexFailureTypes = _.findIndex(newFailureTypes, {customer:row.customer, version:row.version, test_suite:row.test_suite, test_case:row.test_case});
    let editedItemIndexTests = _.findIndex(newTests, {customer:row.customer, version:row.version, test_suite:row.test_suite, test_case:row.test_case});
    //console.log(row);
    //console.log(editedItemIndexTests);
    newFailureTypes.splice(editedItemIndexFailureTypes, 1, {customer:row.customer, version:row.version, project:row.project, test_suite:row.test_suite, test_case:row.test_case, failure_type:type.length? type:"(analysis in progress)"});

    let editedItemTests = newTests[editedItemIndexTests];
    editedItemTests.failure_type = type.length? type:"(analysis in progress)";
    newTests.splice(editedItemIndexTests, 1,editedItemTests);
    this.setState({failureTypes:newFailureTypes, tests: newTests});
  }

  loadAnalyses() {
    console.log("Loading analyses...");
      $.ajax({
            type: "GET",
            url: "http://bxb-phat3-lnx:8085/mostRecentAnalyses",
            dataType: "text",
            success: function(content) {              
              analysisNotes = processData(content);
              this.setState({analysesLoaded:true, failureTypes: analysisNotes, loadedPercentage:this.state.loadedPercentage+10})
              console.log("Analyses Loaded");
              this.mergeTestsWithFailureTypes();
            }.bind(this)
          });
      }

  loadLastNightlyLinksNew = () => {
    console.log("Loading links...");
    $.ajax({
        type: "GET",
        url: "http://bxb-phat3-lnx:8085/nightlyData/links",
        dataType: "text",
        success: function(content) {
          lastNightlyLinks = processData(content);
          this.setState({nightlyLinksLoaded:true, loadedPercentage:this.state.loadedPercentage+20});
          console.log("Links loaded");
          }.bind(this)
      });
  }

  loadOverallTrends = () => {
    console.log("Loading trends...");
    $.ajax({
            type: "GET",
            url: "http://bxb-phat3-lnx:8085/nightlyData/overallTrends",
            dataType: "text",
            success: function(content) {
              overallTrends = processData(content);
              this.setState({overallTrendsLoaded:true, loadedPercentage:this.state.loadedPercentage+10});
              console.log("Trends loaded");
              }.bind(this)
         });
  }

  loadDeploymentData = () => {
    console.log("Loading deployment data...");
    $.ajax({
                type: "GET",
                url: "http://bxb-phat3-lnx:8085/deploymentData",
                dataType: "text",
                success: function(content) {
                  deploymentData = processData(content).sort(function(a, b) {
                                                                                a = new Date(a.deployment_timestamp);
                                                                                b = new Date(b.deployment_timestamp);
                                                                                return a>b ? -1 : a<b ? 1 : 0;
                                                                            });
                  this.setState({deploymentDataLoaded:true, loadedPercentage:this.state.loadedPercentage+10});
                  console.log("Deployment data loaded");
              }.bind(this)
            });
  }

  loadNightlyDataDetailed = () => {
    console.log("Loading detailed data...");
    $.ajax({
            type: "GET",
            url: "http://bxb-phat3-lnx:8085/nightlyData/detailed",
            dataType: "text",
            success: function(content) {
              let extractedTests=processData(content);
              let extractedTestsWithFailureType = extractedTests.map((i)=> {i['failure_type'] = this.getFailureTypeValueOnly(i); return i });
              let extractedCustomers=_.keys(_.keyBy(overallTrends,"customer"));
              let extractedVersions=_.keys(_.keyBy(overallTrends,"version"));
              let extractedProjects=_.keys(_.keyBy(overallTrends,"project"));
              this.setState({tests:extractedTestsWithFailureType, resultsArray:extractedTestsWithFailureType, results:extractedTestsWithFailureType.length, trends:overallTrends, customers:extractedCustomers, versions: extractedVersions, projects: extractedProjects, detailedDataLoaded:true, loadedPercentage:this.state.loadedPercentage+50});
              console.log("Detailed data loaded");              
              console.log("Is data loaded? " + this.isDataLoaded());
              this.mergeTestsWithFailureTypes();             
              }.bind(this)
            })
  }

  mergeTestsWithFailureTypes = () => {
    if(this.state.detailedDataLoaded && this.state.analysesLoaded && !this.state.testsMergedWithFailureTypes) {
      let testsWithFailureType = this.state.tests.map((i)=> {i['failure_type'] = this.getFailureTypeValueOnly(i); return i });
      console.log("Tests merged with failure types");
      this.setState({tests:testsWithFailureType, testsMergedWithFailureTypes:true});
    }
  }

  isDataLoaded = () => {
    //IMPORTANT: edit this function if more data is to be loaded before displaying app
    return this.state.detailedDataLoaded && this.state.nightlyLinksLoaded && this.state.deploymentDataLoaded && this.state.overallTrendsLoaded && this.state.analysesLoaded && this.state.testsMergedWithFailureTypes;
  }


  constructor(props) {
    super(props);
    this.state = {
      tests: [],
      results: 0,
      resultsArray: [],
      trends: [],
      logLink:"404",
      filterCriteria:{},
      grouping:GROUPING_OPTIONS[0],
      customers: {},
      versions: {},
      projects: {},
      startDate: moment(),
      fullSize:true,
      analysisReportOpen:false,
      dashboardGrouping:"by Deployment",
      detailedDataLoaded: false,
      nightlyLinksLoaded: false,
      deploymentDataLoaded: false,
      overallTrendsLoaded: false,
      analysesLoaded:false,
      testsMergedWithFailureTypes:false,
      loadedPercentage:0
    };

    this.afterColumnFilter = this.afterColumnFilter.bind(this);
    this.setCustomerFilter = this.setCustomerFilter.bind(this);
    this.setVersionFilter = this.setVersionFilter.bind(this);
    this.setProjectFilter = this.setProjectFilter.bind(this);
    this.setGrouping = this.setGrouping.bind(this);
    this.setDate = this.setDate.bind(this);
    this.resize = this.resize.bind(this);
    this.loadAnalyses = this.loadAnalyses.bind(this);
    this.setAnalysisType = this.setAnalysisType.bind(this);
    this.closeAnalysisReportPopup = this.closeAnalysisReportPopup.bind(this);
    this.openAnalysisReportPopup = this.openAnalysisReportPopup.bind(this);
    this.setDashboardGrouping = this.setDashboardGrouping.bind(this);    
  }

  setDashboardGrouping(event) {
    this.setState({dashboardGrouping: event.target.value});
  }

  componentWillMount(){
    this.loadNightlyDataDetailed();
    this.loadOverallTrends();
    this.loadLastNightlyLinksNew();
    this.loadDeploymentData();
    this.loadAnalyses();   
  }

  componentDidMount() {
    
    var interval = setInterval(()=> { 
        if(this.refs.customer && this.refs.version && this.refs.project) {
        if (this.props.customer) this.setCustomerFilter({value:this.props.customer});
        if (this.props.version) this.setVersionFilter({value:this.props.version});
        if (this.props.project) this.setProjectFilter({value:this.props.project});
        clearInterval(interval);
      }
    }, 500);
  }

  afterColumnFilter(filterConds, result) {
    this.setState({results:result.length, resultsArray:result});
  }

  setCustomerFilter(option) {
    var newFilterCriteria = this.state.filterCriteria;
    option.value==='All' ? delete newFilterCriteria.customer: newFilterCriteria['customer']=option.value;
    this.setState(newFilterCriteria);
    option.value==='All' ? this.refs.customer.applyFilter('') : this.refs.customer.applyFilter(option.value+'$');
  }

  setVersionFilter(option) {
    var newFilterCriteria = this.state.filterCriteria;
    option.value==='All' ? delete newFilterCriteria.version: newFilterCriteria['version']=option.value;
    this.setState(newFilterCriteria);
    option.value==='All' ? this.refs.version.applyFilter('') : this.refs.version.applyFilter(option.value);
  }

  setProjectFilter(option) {
    var newFilterCriteria = this.state.filterCriteria;
    option.value==='All' ? delete newFilterCriteria.project: newFilterCriteria['project']=option.value;
    this.setState(newFilterCriteria);
    option.value==='All' ? this.refs.project.applyFilter('') : this.refs.project.applyFilter(translateDBNameToProjectName(option.value));
  }

  setDate(date) {
    this.setState({
      startDate: date
    });
  }

  resize() {
    this.setState({fullSize:!this.state.fullSize});
  }

  setGrouping(option) {
    this.setState({
      grouping: option.value
    });    
  }

  closeAnalysisReportPopup() {
    this.setState({analysisReportOpen:false});
  }

  openAnalysisReportPopup() {
    this.setState({analysisReportOpen:true});
  }

  render() {

    const options = {
      noDataText: 'No results found',
    afterColumnFilter: this.afterColumnFilter
  };
  
  let resizeIcon = this.state.fullSize ? <Glyphicon glyph="glyphicon glyphicon-resize-small" /> : <Glyphicon glyph="glyphicon glyphicon-resize-full" />;  

  if(this.isDataLoaded())
  {
    let chosenGroupingDisplay = null;
    /*if(this.state.grouping === 'None')*/ chosenGroupingDisplay = <Grid className="details-table-container" fluid={this.state.fullSize}>
        <Row>
          <Col md={4} className="left-align"><h5>Test Case Details</h5></Col>
          <Col md={4} className="center-align"><h5>{this.state.results} results</h5></Col>
          <Col md={4} className="right-align">
          <ButtonGroup>
          <Button bsSize="sm" onClick={this.openAnalysisReportPopup}> Analysis Report</Button>
          <Modal dialogClassName="modal-xl" show={this.state.analysisReportOpen} onHide={this.closeAnalysisReportPopup} bsSize="lg">
          <Modal.Header closeButton><Modal.Title> Analysis Report</Modal.Title> </Modal.Header>
          <Modal.Body> <AnalysisReport testsInView={this.state.resultsArray} /> </Modal.Body>
          </Modal>
          <Button bsSize="sm" onClick={this.refs.table ? this.refs.table.handleExportCSV : null} bsStyle="primary">Export to CSV</Button>
          </ButtonGroup>
          </Col>
        </Row>
        <Row>
        <Col md={12}>
        <BootstrapTable bordered={ false }
        tableStyle={ { border: 'none' } }
          containerStyle={ { border: 'none' } }
          headerStyle={ { border: 'none' } }
          bodyStyle={ { border: 'none' } }
          trClassName="details-table-row"
        ref='table' data={ this.state.tests } pagination={true} options={ options }>
          <TableHeaderColumn className="details-table-header-column" editable={ false } ref='sno' dataField='sno' hidden isKey={true} >SNo</TableHeaderColumn>
          <TableHeaderColumn className="details-table-header-column" editable={ false } ref='report_date' hidden dataField='report_date' >Date</TableHeaderColumn>
          <TableHeaderColumn className="details-table-header-column" width='20%' dataSort={ true } editable={ false } ref='customer' dataField='customer' filter={ { type: 'RegexFilter', placeholder: 'Please enter a regex' } }>Customer</TableHeaderColumn>
          <TableHeaderColumn className="details-table-header-column" width='15%' dataSort={ true } editable={ false } ref='version' dataField='version' filter={ { type: 'RegexFilter', placeholder: 'Please enter a regex' } }>Version</TableHeaderColumn>
          <TableHeaderColumn className="details-table-header-column" width='30%' dataSort={ true } editable={ false } ref='project' dataField='project' filter={ { type: 'RegexFilter', placeholder: 'Please enter a regex' } }>Project</TableHeaderColumn>
          <TableHeaderColumn className="details-table-header-column" width='40%' dataSort={ true } editable={ false } ref='test_suite' dataField='test_suite'  filter={ { type: 'RegexFilter', placeholder: 'Please enter a regex' } } >Test Suite</TableHeaderColumn>
          <TableHeaderColumn className="details-table-header-column" width='60%' dataSort={ true } editable={ false } ref='test_case' dataFormat={this.linkLoader} dataField='test_case' filter={ { type: 'RegexFilter', placeholder: 'Please enter a regex' } }>Test Case</TableHeaderColumn>
          <TableHeaderColumn className="details-table-header-column" width='20%' dataSort={ true } editable={ false } ref='status'  dataField='status' filter={ { type: 'RegexFilter', placeholder: 'Please enter a regex' } }>Status</TableHeaderColumn>
          <TableHeaderColumn className="details-table-header-column" width='46%' editable={ false } ref='trend' dataField='trend' dataFormat={ this.trendFormatterRelay } filter={ { type: 'CustomFilter', getElement: getCustomFilter,  options: trendType, customFilterParameters:{initialTrend:this.props.initialTrend} } }>Trend</TableHeaderColumn>
          <TableHeaderColumn className="details-table-header-column" editable={ false } ref='trend_dates' hidden dataField='trend_dates'>Trend_Date</TableHeaderColumn>
          <TableHeaderColumn className="details-table-header-column" dataSort={ true } editable={ false } width='17%'  dataField='failure_type' filter={ { type: 'TextFilter' } } dataFormat={this.getFailureType} ref='failure_type' >Failure Type</TableHeaderColumn>
        </BootstrapTable>
        </Col>
        </Row>
      </Grid>;

     /* else if(this.state.grouping === 'By Script') chosenGroupingDisplay = <Grid className="details-table-container" fluid={this.state.fullSize}>
        <Row>
          <Col md={12}>
          <table className="flat-table">
          <thead>
          <tr>
          <th> S.No</th>
          <th>Script</th>
          {
            filteredCustomers.map((x,i) => {return <th key={i}> {x} </th>})
          }
          <th>Analysis Hint</th>
          <th>Analysis Document</th>
          </tr>
          </thead>
          <tbody>
                    {
                      failedTestCaseNames.map(function(x,i){
                        let testCaseObject = failedTestCasesWithDetails[x][0];
                        let analysisHint = _.filter(analysisNotes, {title:"Analysis Hint", test_case:testCaseObject.test_case});
                        //console.log(JSON.stringify(analysisHint));

                        return (
                        <tr key={i+1}>
                        <td>{i+1}</td>
                        <td>{ x }</td>
                        {filteredCustomers.map((y,i) => {
                          let resultForCustomer = _.find(allResults,{customer:y, version:"v6.5.1", test_case:testCaseObject.test_case, test_suite:testCaseObject.test_suite});
                          let statusForCustomer = resultForCustomer ? resultForCustomer.status : "";
                          let rowForCustomer = testCaseObject; rowForCustomer['customer']=y;

                          return <td key={i} className="center-align"> 
                                  <StatusLabel status={statusForCustomer} row={rowForCustomer} testCase={testCaseObject.test_case} testSuite={testCaseObject.test_suite} project={testCaseObject.project} date={currentDate}/></td>
                                })}
                                <td style={{width:"20%"}}> <EditableList testCase={testCaseObject.test_case} initialItems={analysisHint} /> </td>
                                <td></td>
                                </tr>
                        )})
                    }
          </tbody>
          </table>
          </Col>          
        </Row>
      </Grid>;*/

    return (
      <ReactCSSTransitionGroup
      transitionName="example"
      transitionAppear={true}
      transitionAppearTimeout={2000}
      transitionEnter={false}
      transitionLeave={false}>

      <div >
      <div className="page-header">
      <Grid fluid={this.state.fullSize}>
        <Row>
          <Col md={4}>
          <h2> PHAT Analytics <Button style={{marginBottom:"0.35em"}} bsSize="xsmall" onClick={this.resize}>{resizeIcon}</Button></h2>
          </Col>           
          <Col md={6} className="right-align">
          <h2><DatePicker
            customInput={<DatePickerWithDisplay />}
            selected={this.state.startDate}
            onChange={this.setDate}
            todayButton={"Today"}
            maxDate={moment()}
            /></h2>
          </Col>         
          <Col md={2} className="right-align">
            <h2><img alt="cisco-logo" src="Cisco_logo.svg" width={65} /></h2>            
          </Col>
          </Row>
          </Grid>
          </div>
      <Affix affixClassName="affix" container={this}>
        <div className="top-filter-pane">
          <Grid fluid={this.state.fullSize}>
            <Row>
              <Col md={3}>
              <div className="filter-title">customer</div>
              <Dropdown options={['All'].concat(this.state.customers)} value={this.props.customer? this.props.customer:""} onChange={this.setCustomerFilter} />
              </Col>
              <Col md={3}>
              <div className="filter-title">version</div>
              <Dropdown options={['All'].concat(this.state.versions)} onChange={this.setVersionFilter} value={this.props.version? this.props.version:""}/>
              </Col>
              <Col md={3}>
              <div className="filter-title">project</div>
              <Dropdown options={['All'].concat(this.state.projects)} onChange={this.setProjectFilter} value={this.props.project? this.props.project:""}/>
              </Col>
              <Col md={3}>
              <div className="filter-title">visualization</div>
              <Dropdown options={GROUPING_OPTIONS} onChange={this.setGrouping}/>
              </Col>
            </Row>
          </Grid>
        </div>
      </Affix>
      <br /><br />
      <Grid className={ this.state.grouping==='Donut Chart, Histogram' ? "": "hidden" } fluid={this.state.fullSize}>      
      <Row>
      <Col md={6}> <h5>Current and Historical Pass Percentage</h5></Col><Col md={6}><select value={this.state.dashboardGrouping} onChange={this.setDashboardGrouping} className="pull-right"><option value="by Project">by Project</option><option value="by Deployment">by Deployment</option><option value="by Version">by Version</option></select></Col>
      <hr />
      </Row>
      <Row className={ this.state.dashboardGrouping==='by Version' ? "": "hidden" }>
      <Col md={12}>
      <div className="horizontal-scroll">
      {
        /*var filterCriteria ;
        this.state.customerFilter==='All' ? {} : filterCriteria['customer']=this.state.customerFilter;
        this.state.versionFilter==='All' ? {} : filterCriteria['version']=this.state.versionFilter;*/
       d3.nest()
          .key(function(d) { return d.version; })
          .rollup(function(v) { return {            
            version: v[0].version,
            totalTrend: v.map((row) => getProjectTrendBig(row.customer, row.version, row.project,"total_trend"))
                          .reduce((acc, val) => acc.map((num, idx) => num + parseInt(val[idx],10)),_.fill(Array(50),0)),
            passTrend: v.map((row) => getProjectTrendBig(row.customer, row.version, row.project,"pass_trend"))
                          .reduce((acc, val) => acc.map((num, idx) => num + parseInt(val[idx],10)),_.fill(Array(50),0))
          }; })
          .entries(_.sortBy(_.filter(this.state.trends,this.state.filterCriteria), [(o)=> {return o.passedtestcase/o.totaltestcases}]))
          .map(function(row)
          {
            return <DashCard key={row.values.version} heading={row.values.version} passTrend={row.values.passTrend} totalTrend={row.values.totalTrend} />
          })
        }
    </div>
      </Col>
      </Row>
      <Row className={ this.state.dashboardGrouping==='by Deployment' ? "": "hidden" }>
      <Col md={12}>
      <div className="horizontal-scroll">
      {
        /*var filterCriteria ;
        this.state.customerFilter==='All' ? {} : filterCriteria['customer']=this.state.customerFilter;
        this.state.versionFilter==='All' ? {} : filterCriteria['version']=this.state.versionFilter;*/
       d3.nest()
          .key(function(d) { return d.customer+"-"+d.version; })
          .rollup(function(v) { return {
            customer: v[0].customer,
            version: v[0].version,
            totalTrend: v.map((row) => getProjectTrendBig(row.customer, row.version, row.project,"total_trend"))
                          .reduce((acc, val) => acc.map((num, idx) => num + parseInt(val[idx],10)),_.fill(Array(50),0)),
            passTrend: v.map((row) => getProjectTrendBig(row.customer, row.version, row.project,"pass_trend"))
                          .reduce((acc, val) => acc.map((num, idx) => num + parseInt(val[idx],10)),_.fill(Array(50),0))
          }; })
          .entries(_.sortBy(_.filter(this.state.trends,this.state.filterCriteria), [(o)=> {return o.passedtestcase/o.totaltestcases}]))
          .map(function(row)
          {
            return <DashCard key={row.values.customer+" "+row.values.version} heading={row.values.customer} subheading={row.values.version} passTrend={row.values.passTrend} totalTrend={row.values.totalTrend} />
          })
        }
    </div>
      </Col>
      </Row>
       <Row className={ this.state.dashboardGrouping==='by Project' ? "": "hidden" }>
      <Col md={12}>
      <div className="horizontal-scroll">
      {
        /*var filterCriteria ;
        this.state.customerFilter==='All' ? {} : filterCriteria['customer']=this.state.customerFilter;
        this.state.versionFilter==='All' ? {} : filterCriteria['version']=this.state.versionFilter;*/

        _.sortBy(_.filter(this.state.trends,this.state.filterCriteria), [(o)=> {return o.passedtestcase/o.totaltestcases}]).map(function(row)
    {
      return <DashCard key={row.customer+" "+row.version+" "+row.project} heading={row.customer+" "+row.version} subheading={row.project} passTrend={getProjectTrendBig(row.customer, row.version, row.project,"pass_trend")} totalTrend={getProjectTrendBig(row.customer, row.version, row.project,"total_trend")} />
    })}
    </div>
      </Col>
      </Row>
      <br /><br />
      </Grid>      
            
      {chosenGroupingDisplay}
      
      <br /><br /><br /><br />
      <Grid fluid={this.state.fullSize}>
        <Row>
          <Col md={3}>
            <h5 style={{color:"rgb(200,200,200)"}}>PrimeHome Automation Tool</h5>
          </Col>
        </Row>
      </Grid>

      </div>
      </ReactCSSTransitionGroup>
    );

  }

  else    
    return (<div className="centered-loader"><LoadingIndicator value={this.state.loadedPercentage} /></div>);
    
  }

  handlerClickCleanFiltered() {
    this.refs.customer.cleanFiltered();
    this.refs.project.cleanFiltered();
    this.refs.test_suite.cleanFiltered();
    this.refs.test_case.cleanFiltered();
    this.refs.status.cleanFiltered();
    this.refs.start_time.cleanFiltered();
  }
}


export function soapify(str)
{
  str = str.replace(/ /g, '_');
  str = str.replace(/[^a-z0-9_]/gi, '');
  //console.log(str);
  return str;
}

export function StatusLabel(props)
{
  var cssClass="";
  //console.log(props.row);
  if(props.status === 'FAIL' || props.status === 'Failure') cssClass="failure-icon";
    else if(props.status === 'PASS' || props.status === 'Success') cssClass="success-icon";      

  return <TrendUnitInTable row={props.row} cell={props.row.trend} name={props.row.test_case} logLink={getLink(props.row.trend, props.row, props.date)} testSuite={props.row.test_suite} testCase={props.row.test_case}
              project={props.row.project} startTime={props.row.start_time} endTime={props.row.end_time} requiredDates={requiredDates} trend={props.row.trend} trendDates={props.row.trend_dates} statusIcon={cssClass} date={currentDate}/>
}