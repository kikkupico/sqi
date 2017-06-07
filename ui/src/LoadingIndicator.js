import React from 'react';
import {ProgressBar} from 'react-bootstrap';

export default class LoadingIndicator extends React.Component {

  render() {
    return (
      <div><h2>Loading <img className="loading-image" height="30" role="presentation" src="loading.svg" /></h2>
      {this.props.value? <ProgressBar active now={this.props.value} />: ""}
      </div>
    );
  }
}

LoadingIndicator.propTypes = {
  value: React.PropTypes.number       
}

LoadingIndicator.defaultProps = {
  value:0
}
