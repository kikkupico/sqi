import React from 'react';
import {Button,Modal, Tabs, Tab} from 'react-bootstrap';
import StepLogs from './StepLogs';
import TestCaseDefinition from './TestCaseDefinition';
import TestCaseEditHistory from './TestCaseEditHistory';
import ProductEditHistory from './ProductEditHistory';
import { trendFormatter} from './App'
import TestCasesRanParallel from './TestCasesRanParallel';
import AnalysisHelper from './AnalysisHelper';

export default class TestCasePopUp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      logLink: this.props.logLink,
      currentDate: this.props.date
    };
    this.changeLogLink = this.changeLogLink.bind(this);
    this.closePopup = this.closePopup.bind(this);
  }

  componentDidMount() {

  }

  changeLogLink(link, date) {
    //console.log("Log link has been changed to " + link);
    this.setState({ logLink: link, currentDate: date});
  }

  closePopup()
  {
    this.props.close();
  }

  render() {

    //console.log(JSON.stringify(this.props.TrendUnitInTables));

      return (
          <Modal show={this.props.showModal} onHide={this.props.onHide} bsSize="lg">
            <Modal.Header closeButton>
            <span style={{color:"#ccc"}}> {this.props.row.customer} {this.props.row.version} > {this.props.row.project.startsWith('Sanity') ? "Sanity" : this.props.project.startsWith('Regression')? "Regression":this.props.project} > {this.props.testSuite} </span>
            <span style={{color:"#ccc", marginRight:"1.8em"}} className="pull-right">{this.state.currentDate} </span>
              <Modal.Title>{this.props.testCase}
              <span className="pull-right" style={{marginRight:"1em"}}>{trendFormatter(this.props.cell, this.props.row, "embedded", this.changeLogLink, this.state.currentDate)}</span>
            </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Tabs defaultActiveKey={this.props.activeTab ? this.props.activeTab : 1} id="test-case-details-tabs">
              <Tab eventKey={1} title="Execution Details"><StepLogs testSuite={this.props.testSuite } testCase={this.props.testCase } logLink={this.state.logLink}/></Tab>
              <Tab eventKey={2} title="Test Case Details" ><TestCaseDefinition testSuite={this.props.testSuite } testCase={this.props.testCase } project={this.props.project} logLink={this.state.logLink} /></Tab>
              <Tab eventKey={3} title="Edit History" ><TestCaseEditHistory testSuite={this.props.testSuite } testCase={this.props.testCase } project={this.props.project} logLink={this.state.logLink} /></Tab>
              <Tab eventKey={4} title="Product Info" ><ProductEditHistory row={this.props.row} date={this.state.currentDate}/></Tab>
              <Tab eventKey={5} title="Test Case Ran Parallel" ><TestCasesRanParallel row={this.props.row} /></Tab>
              <Tab eventKey={6} title="Analysis" ><AnalysisHelper onAnalysisChange={this.props.onAnalysisChange} row={this.props.row} /></Tab>
            </Tabs>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.closePopup}>Close</Button>
            </Modal.Footer>
          </Modal>
      )
  }
}
