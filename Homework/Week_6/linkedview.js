/*
Harmke Vliek
10989137
script for D3 linked views
*/

//  svg variables
var height = 400

window.onload = function() {
  // load data from data.json
  d3.json('data.json').then(function(data) {
     var province = Object.keys(data);
     var values = Object.values(data);
     var listProvince = [];
     var listTotalTrans = [];

  // select total reizigerskilometers data to put in map
  for (var index = 0; index < province.length; index++) {
    listProvince.push(province[index])
    for (var j = 0; j < values[index].length; j++) {
      if (values[index][j]["Vervoerwijzen"] === "Totaal") {
        listTotalTrans.push(values[index][j]["Reizigerskilometers (mld km)"])
      };
    };
  };

  // create variable to colour map
  var totalKm = {
    "NL-OV": parseFloat(listTotalTrans[3]),
  	"NL-FR": parseFloat(listTotalTrans[1]),
  	"NL-UT": parseFloat(listTotalTrans[6]),
  	"NL-GE": parseFloat(listTotalTrans[5]),
  	"NL-FL": parseFloat(listTotalTrans[4]),
    "NL-NH": parseFloat(listTotalTrans[7]),
    "NL-ZE": parseFloat(listTotalTrans[9]),
    "NL-ZH": parseFloat(listTotalTrans[8]),
    "NL-GR": parseFloat(listTotalTrans[0]),
    "NL-DR": parseFloat(listTotalTrans[2]),
    "NL-NB": parseFloat(listTotalTrans[10]),
    "NL-LI": parseFloat(listTotalTrans[11])
  }

  // show map of the Netherlands, imported from http://jvectormap.com/maps/countries/netherlands/
  $('#map').vectorMap({
  map: 'nl_merc',
  focusOn: {
       x: 0.6,
       y: -0.2,
       scale: 9
  },
  series: {
    regions: [{
      values: totalKm,
      scale: ['#C8EEFF', '#0071A4'],
      normalizeFunction: 'polynomial'
    }]
  },
  onRegionTipShow: function(e, el, code){
    el.html(el.html()+' (GDP - '+totalKm[code]+')');
  }
});

// set height of svg
d3.select(".jvectormap-container")
  .select("svg")
  .attr("height", height)
  });
};
