import React from 'react';
import $ from 'jquery';
import {soapify} from './App';
import LoadingIndicator from './LoadingIndicator';
import parseUrl from 'parse-url';

export default class StepLogs extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      content: "",
      progress: 10
    };
  }

  componentWillReceiveProps(nextProps)
  {
    //console.log(this.props.logLink + " " + nextProps.logLink);
    if(this.props.logLink === nextProps.logLink) return;

    if(nextProps.logLink === "404") {this.setState({ready:true, content:"<h3> Logs not found </h3>"}); return;}

    this.setState({ready:false, progress:10});

    var _this = this;
    //console.log("Attempting to change logs");

     if(nextProps.logLink.endsWith('Report.html')) this.setState({ready:true, content:`<h3><a target="_blank" href="${nextProps.logLink.substring(0,nextProps.logLink.lastIndexOf('/'))}/test_reports/${this.props.testCase}">Click here to view execution report dated ${nextProps.logLink.match(/-...._.._..-.*\//)[0].replace('/test_reports/',"")}</a></h3>`})
      else

    $.ajax({
        type: "GET",
        url: "http://bxb-phat3-lnx:8085/logFiles/" + parseUrl(nextProps.logLink).resource + "/"
        + (nextProps.logLink.indexOf("8080") > -1 ? 
        nextProps.logLink.substring(nextProps.logLink.indexOf("Nightly-Run-Reports/")+"Nightly-Run-Reports/".length,nextProps.logLink.indexOf("/log/")) + "/" + soapify(this.props.testSuite) + "-" + soapify(this.props.testCase) + "-"
        :nextProps.logLink.substring(nextProps.logLink.indexOf(":80")+6,nextProps.logLink.indexOf("/log/")) + "/" + soapify(this.props.testSuite) + "-" + soapify(this.props.testCase) + "-"),
        dataType: "text",
        statusCode: {
          200: function(response)
        {
          //_this.setState({content: response});
          var newContent = "";
          var logFileNames = response.split('\n');
          var pending = 0;

          logFileNames.map(function(line, i)
          {
            if(line.length > 1)
            {
              //console.log(pending);
              pending++;
              //console.log("Loading " + _this.props.logLink.replace("8080/NBI-Nightly-Run-Reports","9090")+line);
              $.ajax(
                {
                  type:"GET",
                  url:nextProps.logLink+line,
              dataType:"text",
              statusCode: {
                200: function(response)
              {
                newContent += `<h2>Step ${i+1} </h2><textarea rows=20 cols=120 disabled>${response}</textarea>`;
                //console.log(pending);
                pending--;
                _this.setState({progress:(logFileNames.length-pending)/logFileNames.length*100});
                if(pending === 0) _this.setState({ready:true, content: newContent, progress:100});
              },
              404: function(response) {
                newContent += `<h2> Unable to load logs for Step ${i+1}`
              }
              }});              
            }
            else
            {
              //console.log(pending);
              if(pending === 0) _this.setState({ready:true, content: newContent, progress:100});
            }            
            return true;
        })
      },

        500: function(response)
        {
          _this.setState({ready:true, content: "ERROR: Unable to fetch logs"});
        }
      }
        
        });
  }

  componentDidMount()
  {
    var _this = this;
    //console.log("loading log html...");

    if(this.props.logLink === "404") {this.setState({ready:true, content:"<h3> Logs not found </h3>"}); return;}

     if(this.props.logLink.endsWith('Report.html')) this.setState({ready:true, content:`<h3><a target="_blank" href="${this.props.logLink.substring(0,this.props.logLink.lastIndexOf('/'))}/test_reports/${this.props.testCase}">Click here to view execution report dated ${this.props.logLink.match(/-...._.._..-.*\//)[0].replace('/test_reports/',"")}</a></h3>`})
      else

    $.ajax({
        type: "GET",
        url: "http://bxb-phat3-lnx:8085/logFiles/" + parseUrl(_this.props.logLink).resource + "/" +
        (_this.props.logLink.indexOf("8080") > -1 ? 
        _this.props.logLink.substring(_this.props.logLink.indexOf("Nightly-Run-Reports/")+"Nightly-Run-Reports/".length,_this.props.logLink.indexOf("/log/")) + "/" + soapify(this.props.testSuite) + "-" + soapify(this.props.testCase) + "-"
        :_this.props.logLink.substring(_this.props.logLink.indexOf(":80")+6,_this.props.logLink.indexOf("/log/")) + "/" + soapify(this.props.testSuite) + "-" + soapify(this.props.testCase) + "-"),
        dataType: "text",
        statusCode: {
          200: function(response)
        {
          //_this.setState({content: response});
          //console.log(response);
          var newContent = "";
          var logFileNames = response.split('\n');
          var pending = 0;

          logFileNames.map(function(line, i)
          {
            if(line.length > 1)
            {
              //console.log(pending);
              pending++;
              //console.log("Loading " + _this.props.logLink.replace("8080/NBI-Nightly-Run-Reports","9090")+line);
              $.ajax(
                {
                  type:"GET",
                  url:_this.props.logLink+line,
              dataType:"text",
              statusCode: {
                200: function(response)
              {
                newContent += `<h2>Step ${i+1} </h2><textarea rows=20 cols=120 disabled>${response}</textarea>`;
                //console.log(pending);
                pending--;
                _this.setState({progress:(logFileNames.length-pending)/logFileNames.length*100});
                if(pending === 0) _this.setState({ready:true, content: newContent, progress:100});
              }
              }});              
            }
            else
            {
              //console.log(pending);
              if(pending === 0) _this.setState({ready:true, content: newContent, progress:100});
            }            
            return true;
        })
      },

        500: function(response)
        {
          _this.setState({ready:true, content: "ERROR: Unable to fetch logs"});
        }
      }
        
        });
  }

  render() {
    //console.log("Render received for content " + this.state.content);
    if(this.state.ready)
    {
      //console.log('Ready to render');
      return (
      <div dangerouslySetInnerHTML={{ __html: this.state.content }} />
    );

    }
    
  else 
    {
      //console.log(this.state.progress);
      return <div><LoadingIndicator value={this.state.progress} /></div>;
    }
  }
}
