/*
Harmke Vliek
10989137
script for D3 linked views
*/

window.onload = function() {
  // show map of the Netherlands, imported from http://jvectormap.com/maps/countries/netherlands/
  $('#map').vectorMap({map: 'nl_merc'});

  //load data from data.json
  d3.json('data.json').then(function(data) {
     var province = Object.keys(data);
     var values = Object.values(data);
     console.log(province)
     console.log(values)
});
};
