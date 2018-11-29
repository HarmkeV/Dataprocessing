/*
Harmke Vliek
10989137
script for D3 scatter plot:
*/

var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"

var requests = [d3.json(womenInScience), d3.json(consConf)];

Promise.all(requests).then(function(response) {
    doFunction(response);
}).catch(function(e){
    throw(e);
});

window.onload = function(){
  log.console(e)
};
