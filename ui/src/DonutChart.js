import React from 'react';
import {color} from './utilityFunctions';

export default class DonutChart extends React.Component {

  render() {

    const halfsize = (this.props.size * 0.5);
    const radius = halfsize - (this.props.strokewidth * 0.5);
    const circumference = 2 * Math.PI * radius;
    const strokeval = ((this.props.value * circumference) / 100);
    const dashval = (strokeval + ' ' + circumference);

    const trackstyle = {strokeWidth: this.props.strokewidth};
    const indicatorstyle = {strokeWidth: this.props.strokewidth, strokeDasharray: dashval, stroke: color(this.props.value)}
    const rotateval = 'rotate(-90 '+halfsize+','+halfsize+')';

    return (
      <svg width={this.props.size} height={this.props.size} className="donutchart">
        <circle r={radius} cx={halfsize} cy={halfsize} transform={rotateval} style={trackstyle} className="donutchart-track"/>
        <circle r={radius} cx={halfsize} cy={halfsize} transform={rotateval} style={indicatorstyle} className="donutchart-indicator"/>
        <line x1={halfsize-50} y1={halfsize} x2={halfsize+50} y2={halfsize} className="donutchart-seperator"/>
        <text x={halfsize} y={halfsize} style={{textAnchor:'middle'}} >
          <tspan className="donutchart-text-val donutchart-text" x={halfsize} y={halfsize-5}>{this.props.value}</tspan>
          <tspan className="donutchart-text-percent donutchart-text" >%</tspan>
          <tspan className="donutchart-text-label donutchart-text" x={halfsize} y={halfsize+15}>{this.props.valuelabel}</tspan>
        </text>
      </svg>
    );
  }
}

DonutChart.propTypes = {
  value: React.PropTypes.number,        // value the chart should show
  valuelabel: React.PropTypes.string,   // label for the chart
  size: React.PropTypes.number,         // diameter of chart
  strokewidth: React.PropTypes.number   // width of chart line
}

DonutChart.defaultProps = {
  value:0,
  valuelabel:'Pass',
  size:165,
  strokewidth:13
}
