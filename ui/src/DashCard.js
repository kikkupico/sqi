import React from 'react';
import DonutChart from './DonutChart';
//import { Sparklines, SparklinesLine, SparklinesBars } from 'react-sparklines';
import MicroBarChart from 'react-micro-bar-chart'
import _ from 'lodash';
import {requiredDates50} from './App';
import {Glyphicon, Label} from 'react-bootstrap';

export default class DashCard extends React.Component{

  render()
  {
    let delta = _.round((this.props.passTrend[this.props.passTrend.length -1]/this.props.totalTrend[this.props.totalTrend.length -1]-this.props.passTrend[this.props.passTrend.length -2]/this.props.totalTrend[this.props.totalTrend.length -2])*100,2);
    let deltaIndicator = delta>=0 ? delta===0?"":"triangle-top":"triangle-bottom";
    let deltaText = delta===0?<b>=</b>:" " + Math.abs(delta) + "%";
    let deltaVis = <Label bsStyle={delta>=0 ? delta===0?"default":"success":"danger"}><Glyphicon glyph={deltaIndicator} />{deltaText}</Label>
    return (
      <div className="center-align card-holder">
      <div className="card-heading"> {this.props.heading} </div>
      <div className="card-subheading"> {this.props.subheading} </div>
      <br />      
      <DonutChart value={_.round(this.props.passTrend[this.props.passTrend.length -1]/this.props.totalTrend[this.props.totalTrend.length -1]*100,2)}
        valuelabel={this.props.totalTrend[this.props.totalTrend.length -1]-this.props.passTrend[this.props.passTrend.length -1]+" fail | "+this.props.totalTrend[this.props.totalTrend.length -1]+" total"}/>
      <br />
      {deltaVis}
      <div className="trend-bar-graph-container">
        <MicroBarChart data={this.props.passTrend.map((x,i)=>this.props.totalTrend[i]>0 ?_.round(x/(this.props.totalTrend[i])*100, 2)+4.0:4.0)}
  width={200}
  height={50*(_.max(this.props.passTrend.map((x,i)=>this.props.totalTrend[i]>0 ?_.round(x/(this.props.totalTrend[i]), 2)+0.04:0.04)))}
  tooltip
  tipOffset={[0,20]}
  tipTemplate={(d, i, data) => `${d-4}% pass on ${requiredDates50[i]}`}
  hoverColor="#337AB7"
  fillColor="rgb(206,205,201)" />
  </div>
    </div>
    )
  }
}
