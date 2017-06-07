import React from 'react';
import ReactDOM from 'react-dom';
import parseUrl from 'parse-url';
import App from './App';
import './index.css';

//the initial trend setting code is a bit lousy now. needs refactoring
var initialTrend='All';

if (location.search.toLowerCase().indexOf('broken') > -1) initialTrend='Recently Broken';
else if (location.search.toLowerCase().indexOf('fixed') > -1) initialTrend='Recently Fixed';
else if (location.search.toLowerCase().indexOf('erratic') > -1) initialTrend='Erratic';
else if (location.search.toLowerCase().indexOf('never') > -1) initialTrend='Never Passed';

var filterParams = getJsonFromUrl();

ReactDOM.render(
  <App initialTrend={initialTrend} 
  customer={filterParams.customer ? filterParams.customer: ""} 
  version={filterParams.version ? filterParams.version: ""}
  project={filterParams.project ? filterParams.project: ""}
  />,
  document.getElementById('root')
);

function getJsonFromUrl() {
  var query = location.search.substring(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}