import React from 'react';
import $ from 'jquery';
import jQuery from 'jquery';
import AceEditor from 'react-ace';
import 'brace/mode/xml';
import 'brace/theme/xcode';
import {extractProjectNameFromLogLink} from './utilityFunctions';

jQuery.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

export default class TestCaseDefinition extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      content: "<h1>Loading testcase data. Please wait...</h1>",
      mode: "NBI"
    };
  }

  componentDidMount()
  {
    var _this = this;
    //console.log("loading test case xml...");

    var project = (this.props.project.startsWith('Sanity') || this.props.project.startsWith('Regression')) ? this.props.project.substring(0, this.props.project.indexOf('-')) : extractProjectNameFromLogLink(this.props.logLink);
    var testCase = (project.startsWith('Regression')) ? this.props.testCase.replace(this.props.testSuite+"_","") : this.props.testCase;

    $.ajax({
        type: "GET",
        url: "http://bxb-phat3-lnx:8085/"+project+'/'+this.props.testSuite+'/'+testCase,
        dataType: "text",
        success: function(response)
        {
          //console.log('testcase xml loaded');
          if(response.startsWith("ERROR")) {this.setState({content:`<div> ${response} </div>`}); return;}

          else if(project.startsWith('Sanity') || project.startsWith('Regression')) {
            this.setState({content: response, mode:"UI"});
            return;
          }

          //alert(response);
          var $xmlDom = $($.parseXML(response));
          var $steps = $($xmlDom).find("testStep");
          var embeddedContent = "";
          //console.log(`Found ${$steps.children.length} steps`)
          //console.log(JSON.stringify($steps));
          $steps.each(function(index)
          {
            var config = $(this).find("config");
            var uri = config.attr("resourcePath") ? config.attr("resourcePath").replace('/panorama-ui/nbi/',"") : "404";
            var method = config.attr("methodName");
            var parameters = config.find("parameters");
            var assertions = config.find("assertion");

            //console.log(`Processing step ${$(this).attr('name')}`)
            if(uri !== '404')
            embeddedContent += "<br><h3>Step " +JSON.stringify(index+1)+": "+ $(this).attr('name')+
            `</h3> <h4>(<a target="_blank" href="http://ph-bxb-slot1-sl-1:9080/panorama-ui/nbi/application.wadl#${uri}">${uri}->${method}</a>)</h4>`;

            if(parameters.children().length > 0) {
              embeddedContent += "<h4>Parameters</h4>";
              parameters.find("entry, entry").each(function(){
                embeddedContent += `${$(this).attr("key")} : ${$(this).attr("value")}<br>`
              });
            }

            if(assertions.children().length > 0) {
              embeddedContent += "<h4>Assertions</h4>";
              assertions.each(function() {
                var assertion = $(this);
                //embeddedContent += assertion.attr("type")+'<br>';
                switch(assertion.attr("type"))
                {
                  case 'MessageContentAssertion':
                    assertion.find("configuration").find('elements').each(function(){
                      var element = $(this);
                      if(element.find("enabled").text() === "true")
                      embeddedContent += 'Check if ' + element.find("element").text() + element.find("operator").text() + element.find("expectedValue").text() + '<br>';
                    })
                    break;
                  case 'Valid HTTP Status Codes':
                      embeddedContent += "Allowed HTTP Status Codes: " + assertion.text() + '<br>';
                    break;
                  case 'GroovyScriptAssertion':
                      embeddedContent += "Groovy Script Assertion<br><textarea rows=10 cols=120 disabled>" + assertion.text() + '</textarea><br>';
                    break;
                  default:
                    embeddedContent +="Untranslated assertion found; dumped full text below. <br>"+assertion.text()+"<br>";
                }
              });
            }
          });
          //alert(embeddedContent);
          this.setState({content:`<div> ${embeddedContent} </div>`});
        }.bind(this)
      });
  }

  render() {

    if(this.state.mode === "UI") return (
      <AceEditor
    mode="xml"
    theme="xcode"
    width="100%"
    readOnly={true}
    value={this.state.content}
    editorProps={{$blockScrolling: true}}
  />
  )

  else return (
      <div dangerouslySetInnerHTML={{ __html: this.state.content }} />
    );
  }
}
