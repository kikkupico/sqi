import React from 'react';
import {Button, Collapse} from 'react-bootstrap';

export default class Collapsible extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {};
  }

  render() {
    return (
      <div>
        <Button onClick={ ()=> this.setState({ open: !this.state.open })} bsSize="small" bsStyle="link">
          {this.props.title}
        </Button>
        <Collapse in={this.state.open}>
          <div>
            <textarea cols={120} rows={this.props.content.split('\n').length} value={this.props.content} disabled />
          </div>
        </Collapse>
      </div>
    );
  }
}
