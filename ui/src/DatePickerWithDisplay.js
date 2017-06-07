import React from 'react';
import moment from 'moment';

export default class DatePickerWithDisplay extends React.Component
{
  /*constructor(props) {
    super(props);
  }*/

  render () {
return (
<div>
<div className="header-year-display">{moment(this.props.value,"MM/DD/YYYY").format("YYYY")}</div>
<div
className="header-date-display"
onClick={this.props.onClick}>
{moment(this.props.value,"MM/DD/YYYY").format("ddd, MMM Do")}
</div>
</div>
)
}
}
