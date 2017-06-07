import React from 'react';
import {Button,Modal, Tabs, Tab} from 'react-bootstrap';
import StepLogs from './StepLogs';

export default class TestCaseDetail extends React.Component{

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

        <Button
          bsStyle="link"
          onClick={this.open}

        >
          {this.props.name}

        </Button>

        <Modal show={this.state.showModal} onHide={this.close} bsSize="lg">
          <Modal.Header closeButton>
            <Modal.Title>{this.props.name} <span dangerouslySetInnerHTML={{ __html: this.props.trend }}></span> </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Tabs defaultActiveKey={1} id="test-case-details-tabs">
            <Tab eventKey={1} title="Step Logs"><StepLogs testSuite={this.props.testSuite } testCase={this.props.testCase } logLink={this.props.logLink}/></Tab>
            <Tab eventKey={2} title="Definition" >Tab 2 content</Tab>
            <Tab eventKey={3} title="Documentation" >Tab 3 content</Tab>
            <Tab eventKey={4} title="Edit History" >Tab 3 content</Tab>
          </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
