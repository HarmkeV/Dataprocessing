/*
Harmke Vliek
10989137
script for D3 linked views
*/

//  svg variables
var height = 400

window.onload = function() {
  // show map of the Netherlands, imported from http://jvectormap.com/maps/countries/netherlands/
  $('#map').vectorMap({map: 'nl_merc', focusOn: {
       x: 0.6,
       y: -0.2,
       scale: 9
     }});

  // set height of svg
  d3.select(".jvectormap-container")
    .select("svg")
    .attr("height", height)

  //load data from data.json
  d3.json('dataCBS.json').then(function(data) {
     var province = Object.keys(data);
     var values = Object.values(data);
  });


};
