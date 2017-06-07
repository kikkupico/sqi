import React from 'react';

export default class TrendUnit extends React.Component{

  constructor(props) {
    super(props);
    this.clickFunction = this.clickFunction.bind(this);
  }

  clickFunction()
  {if (this.props.onClickFunction && typeof(this.props.onClickFunction) === "function")
    this.props.onClickFunction(this.props.logLink, this.props.date);
  }

  render() {
    return (
      <div title={this.props.date} onClick={this.clickFunction} className={"status-icon " + this.props.statusIcon + " " + this.props.currentnessIcon}>
      </div>
    )
  }
}
