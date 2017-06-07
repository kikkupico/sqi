import React from 'react';
import $ from 'jquery';
import jQuery from 'jquery';
import Collapsible from './Collapsible'
import {extractProjectNameFromLogLink} from './utilityFunctions';
import LoadingIndicator from './LoadingIndicator';

jQuery.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

export default class TestCaseEditHistory extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      content: ""
    };
    this.getContent = this.getContent.bind(this);
  }

  componentDidMount()
  {
    var _this = this;
    //console.log("loading test case edit history...");
    var project = (this.props.project.startsWith('Sanity') || this.props.project.startsWith('Regression')) ? this.props.project.substring(0, this.props.project.indexOf('-')) : extractProjectNameFromLogLink(this.props.logLink);
    var testCase = (project.startsWith('Regression')) ? this.props.testCase.replace(this.props.testSuite+"_","") : this.props.testCase;
    $.ajax({
        type: "GET",
        url: "http://bxb-phat3-lnx:8085/"+project+'/'+this.props.testSuite+'/'+testCase+'/editHistory',
        dataType: "text",
        success: function(response)
        {
          this.setState({content:response});
        }.bind(this)
      });
  }

  getContent(title)
  {
    var titleStart = this.state.content.indexOf(title);
    var contentStart = titleStart + title.length;
    var nextTitle =  /\[.*,.*:.*:.*:.*\]/.exec(this.state.content.substring(contentStart));
    var contentEnd = nextTitle ? this.state.content.indexOf(nextTitle) : this.state.content.length-1;

    return this.state.content.substring(contentStart, contentEnd);
  }

  render() {
    if(this.state.content === "") return <LoadingIndicator />
      else if(this.state.content.startsWith("No")) return ( <h3> Unable to load edit history </h3>);
    else {      
      var gitOutputLines = this.state.content.split('\n');
      return (
        <div><br />{
        gitOutputLines.map(function(line){
          if(line.startsWith('['))
          return ( <Collapsible key={line} title={line} content={this.getContent(line)} /> )
          else return;
        }.bind(this)) }
        </div>
      );
    }

  }
}
