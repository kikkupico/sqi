import React from 'react';
import TestCasePopUp from './TestCasePopUp';

export default class TestCasePopUpLauncherButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  render() {
      return (
        <div>
          <span className="clickable" onClick={this.open}> {this.props.name} </span>
          <TestCasePopUp onAnalysisChange={this.props.onAnalysisChange} activeTab={this.props.activeTab?this.props.activeTab:1} date={this.props.date} row={this.props.row} cell={this.props.cell} project={this.props.project} testSuite={this.props.testSuite } showModal={this.state.showModal} close={this.close} onHide={this.close} testCase={this.props.testCase } logLink={this.props.logLink}>
            {this.props.children}
          </TestCasePopUp>
        </div>
      )
  }
}
 