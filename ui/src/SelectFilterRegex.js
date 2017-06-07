import React from 'react';
import _ from 'lodash';

export var trendType = {'All':'', 'Never Passed': '^((?!(Success|PASS)).)*$', 'Recently Fixed':'.*(Failure|FAIL);(Success|PASS)$', 'Recently Broken':'.*(Success|PASS);(Failure|FAIL)$', 'Erratic':'.*(Success|PASS);(Failure|FAIL).*(Success|PASS);(Failure|FAIL).*'};

export default class SelectFilterRegex extends React.Component {
  constructor(props) {
    super(props);
    this.filter = this.filter.bind(this);
    this.state = {
      value: trendType[this.props.customFilterParameters.initialTrend]
    };
    this.isFiltered = this.isFiltered.bind(this);
  }

  filter(event) {
    //console.log('filter called');
    this.setState({value: event.target.value });
    this.props.filterHandler({ callback: this.isFiltered });
  }

  isFiltered(targetVal) {
    //console.log('isFiltered called');
    var filterVal = this.refs.selectInput.value;
    //console.log('filterVal is ' + JSON.stringify(this.refs.selectInput.value));
   try {
     return new RegExp(filterVal, 'i').test(targetVal);
   } catch (e) {
     return true;
   }
 }

  cleanFiltered() {
    //const value = (this.props.defaultValue !== undefined) ? this.props.defaultValue : '';
    this.setState({value:''});
    this.props.filterHandler({ callback: this.isFiltered });
  }

  applyFilter(filterOption) {
    console.log('applyFilter called');
    this.refs.selectInput.setState({value:filterOption});
    this.props.filterHandler({ callback: this.isFiltered });
  }

  getOptions() {
    const optionTags = [];
    _.map(trendType, (v, k) => {
      optionTags.push(<option key={ k } value={ v }>{ k + '' }</option>);
    });
    return optionTags;
  }

  componentDidMount() {
    /*const value = this.refs.selectInput.value;
    if (value) {
      this.props.filterHandler();
    }*/
    this.props.filterHandler({ callback: this.isFiltered });
  }


  render() {
    /*const selectClass = classSet('filter', 'select-filter', 'form-control',
              { 'placeholder-selected': this.state.isPlaceholderSelected });*/

    return (
      <select ref='selectInput'
          //className={ selectClass }
          onChange={ this.filter } value={this.state.value} >
        { this.getOptions() }
      </select>
    );
  }
}

SelectFilterRegex.propTypes = {
  filterHandler: React.PropTypes.func.isRequired,
  placeholder: React.PropTypes.string,
  columnName: React.PropTypes.string
};

export function getCustomFilter(filterHandler, customFilterParameters) {
  return (
    <SelectFilterRegex filterHandler={ filterHandler } customFilterParameters={ customFilterParameters }/>
  );
}
