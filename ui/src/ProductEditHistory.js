import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import jQuery from 'jquery';
import moment from 'moment';
import {Grid, Row, Col, Button} from 'react-bootstrap';
import {deploymentData} from './App';

jQuery.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

export default class ProductEditHistory extends React.Component{

  constructor(props) {
    super(props);
    this.state = {      
      phCommit: "",
      interopCommit: ""
    };
  }

  //refactor later and remove repetition from the functions below
  componentWillReceiveProps(nextProps)
  {
    //console.log(this.props.logLink + " " + nextProps.logLink);
    if(this.props.date === nextProps.date) return;
    this.setState({phCommit:"", interopCommit:""});

    var _this = this;
    var deploymentDataForDeployment = _.filter(deploymentData, {customer:nextProps.row.customer, version:nextProps.row.version});    
    //2017-02-24 02:06:18.085153-05
    var latestDeploymentDataForDate = _.filter(deploymentDataForDeployment, 
      (o) => { //console.log(moment(this.props.row.report_date,"YYYY-MM-DD").subtract(1, 'days').format('YYYY-MM-DD') + " " + moment(o.deployment_timestamp.substring(0,10),"YYYY-MM-DD").format('YYYY-MM-DD'));
        return moment(nextProps.date,"YYYY-MM-DD").subtract(1, 'days').isSame(moment(o.deployment_timestamp.substring(0,10),"YYYY-MM-DD"))});
    var phCommitLine = latestDeploymentDataForDate.length ? _.find(latestDeploymentDataForDate,{title:"PH Commit"}):"not found";
    //console.log(this.props.row.report_date + " " + moment(phCommitLine.deployment_timestamp,"YYYY-MM-DD hh:mm:ss.SSSSSS-ZZ").format('YYYY-MM-DD'));
    var interopCommitLine = latestDeploymentDataForDate.length ? _.find(latestDeploymentDataForDate,{title:"Interop Commit"}):"not found";
    //console.log(latestDeploymentData);
    //console.log(phCommitLine);
    var phCommit = phCommitLine !== 'not found' ? phCommitLine.description : "not found";
    var interopCommit = interopCommitLine !== 'not found' ? interopCommitLine.description : "not found";
    //console.log(phCommit);

    $.ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Basic " + btoa('ramaveer:1fd63cdfaf79391ab852d2a91ffc158993fd452f'));
            },
              type: "GET",
              url: "https://github4-chn.cisco.com/api/v3/repos/spvss-prime-home/ph-interop/commits/"+interopCommit,
              dataType: "json",
              success: function(response)
              {                      
                this.setState({interopCommit:response});
              }.bind(this)
            });
    
    $.ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Basic " + btoa('ramaveer:1fd63cdfaf79391ab852d2a91ffc158993fd452f'));
            },
              type: "GET",
              url: "https://github4-chn.cisco.com/api/v3/repos/spvss-prime-home/primehome/commits/"+phCommit,
              dataType: "json",
              success: function(response)
              {
                this.setState({phCommit:response});
            }.bind(this)
          });
  }

  componentDidMount()
  {
    var _this = this;
    var deploymentDataForDeployment = _.filter(deploymentData, {customer:this.props.row.customer, version:this.props.row.version});    
    //2017-02-24 02:06:18.085153-05
    var latestDeploymentDataForDate = _.filter(deploymentDataForDeployment, 
      (o) => { //console.log(moment(this.props.row.report_date,"YYYY-MM-DD").subtract(1, 'days').format('YYYY-MM-DD') + " " + moment(o.deployment_timestamp.substring(0,10),"YYYY-MM-DD").format('YYYY-MM-DD'));
        return moment(this.props.date,"YYYY-MM-DD").subtract(1, 'days').isSame(moment(o.deployment_timestamp.substring(0,10),"YYYY-MM-DD"))});
    var phCommitLine = latestDeploymentDataForDate.length ? _.find(latestDeploymentDataForDate,{title:"PH Commit"}):"not found";
    //console.log(this.props.row.report_date + " " + moment(phCommitLine.deployment_timestamp,"YYYY-MM-DD hh:mm:ss.SSSSSS-ZZ").format('YYYY-MM-DD'));
    var interopCommitLine = latestDeploymentDataForDate.length ? _.find(latestDeploymentDataForDate,{title:"Interop Commit"}):"not found";
    //console.log(latestDeploymentData);
    //console.log(phCommitLine);
    var phCommit = phCommitLine !== 'not found' ? phCommitLine.description : "not found";
    var interopCommit = interopCommitLine !== 'not found' ? interopCommitLine.description : "not found";
    //console.log(phCommit);

    $.ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Basic " + btoa('ramaveer:1fd63cdfaf79391ab852d2a91ffc158993fd452f'));
            },
              type: "GET",
              url: "https://github4-chn.cisco.com/api/v3/repos/spvss-prime-home/ph-interop/commits/"+interopCommit,
              dataType: "json",
              success: function(response)
              {                      
                this.setState({interopCommit:response});
              }.bind(this)
            });
    
    $.ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Basic " + btoa('ramaveer:1fd63cdfaf79391ab852d2a91ffc158993fd452f'));
            },
              type: "GET",
              url: "https://github4-chn.cisco.com/api/v3/repos/spvss-prime-home/primehome/commits/"+phCommit,
              dataType: "json",
              success: function(response)
              {
                this.setState({phCommit:response});
            }.bind(this)
          });
  }

  render() {

    let phCommitView = null;
    let interopCommitView = null;
    
    if(this.state.phCommit !== "" ) { phCommitView = 
      <Grid fluid>
      <Row>
      <Col md={1}>
      <a href={this.state.phCommit.author.html_url}><img alt="Committer" className="img-rounded" width={40} src={this.state.phCommit.author.avatar_url}></img></a>
      </Col>
      <Col md={9} className="hack-bootstrap-move-left">
      <div className="git-title" title={this.state.phCommit.commit.message}>{this.state.phCommit.commit.message}</div>
      <b><a href={this.state.phCommit.author.html_url}>{this.state.phCommit.author.login}</a></b> committed {moment(this.state.phCommit.commit.author.date,"YYYY-MM-DDThh:mm:ssZ").fromNow()}
      </Col>
      <Col md={2} className="hack-bootstrap-move-right">
      <Button target="_blank" bsStyle="primary" href={this.state.phCommit.html_url}>{this.state.phCommit.sha.substring(0,7)}</Button>
      </Col>
      </Row>    
      </Grid>;
    }
    
    else
    {
      phCommitView = <h4>Loading</h4>
    }

    if(this.state.interopCommit !== "" ) { interopCommitView = 
      <Grid fluid>           
      <Row>
      <Col md={1}>
      <a href={this.state.interopCommit.author.html_url}><img alt="Committer" className="img-rounded" width={40} src={this.state.interopCommit.author.avatar_url}></img></a>
      </Col>
      <Col md={9} className="hack-bootstrap-move-left">
      <div className="git-title" title={this.state.interopCommit.commit.message}>{this.state.interopCommit.commit.message}</div>
      <b><a href={this.state.interopCommit.author.html_url}>{this.state.interopCommit.author.login}</a></b> committed {moment(this.state.interopCommit.commit.author.date,"YYYY-MM-DDThh:mm:ssZ").fromNow()}
      </Col>
      <Col md={2} className="hack-bootstrap-move-right">
      <Button target="_blank" bsStyle="primary" href={this.state.interopCommit.html_url}>{this.state.interopCommit.sha.substring(0,7)}</Button>
      </Col>
      </Row>
      </Grid>;
    }

    else
    {
      interopCommitView = <h4>Loading</h4>
    }


    return (
      <div>     
      <br />
      <h4> PrimeHome Git History </h4><br />
      {phCommitView}
      <br /><br />
      <h4> Interop Git History </h4><br />
      {interopCommitView}
      </div>
    );
  }
}
