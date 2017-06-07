import parseUrl from 'parse-url';
import d3 from 'd3';

export var color = d3.scale.linear().clamp(true)
            .domain([70, 80, 90, 100])
            .range(['#d7191c','#fdae61','#a6d96a','#1a9641'])
            .interpolate(d3.interpolateHcl);


export function extractProjectNameFromLogLink(logLink) {
	//sample log link: http://bxb-phat3-lnx:8082/PH-Sanity-soapui-project-21-03-2017_01_09_57/log/
	let pathname = parseUrl(logLink).pathname;
	let projectStart = pathname.indexOf('/')+1;
	let projectEnd = pathname.search(/-\d\d-\d\d-\d\d\d\d_\d\d_\d\d_\d\d/);
	return pathname.substring(projectStart, projectEnd);
}

export function cleanIfUIProjectName(p) {
	if(p.startsWith('Regression') || p.startsWith('Sanity')) return 'UI-'+ p.substring(0,p.indexOf('-'));
	else return p;
}

export function rebuildEncodedCSV(s) {
	return s.replace(/<newline>/g,'\n').replace(/<comma>/g,',')
}