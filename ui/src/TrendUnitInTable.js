import React from 'react';
import TestCasePopUp from './TestCasePopUp';
import TrendUnit from './TrendUnit';

export default class TrendUnitInTable extends React.Component{

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
      //console.log("clicked!")
      this.setState({ showModal: true });
    }

  render() {
    return (
      <span>
      <TrendUnit date={this.props.date} onClickFunction={this.open} statusIcon={this.props.statusIcon} currentnessIcon={this.props.currentnessIcon}>
      </TrendUnit>
      <TestCasePopUp onAnalysisChange={this.props.onAnalysisChange} date={this.props.date} row={this.props.row} cell={this.props.cell} project={this.props.project} testSuite={this.props.testSuite } showModal={this.state.showModal} close={this.close} onHide={this.close} testCase={this.props.testCase } logLink={this.props.logLink}></TestCasePopUp>
      </span>
    )
  }
}
