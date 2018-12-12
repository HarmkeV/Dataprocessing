/*
Harmke Vliek
10989137
script for D3 linked views
Use of external library jvectormap for map
*/

//  svg variables
var height = 400;
var width = 500;

window.onload = function() {
  // load data from data.json
  d3.json('dataCBS.json').then(function(data) {
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

  // create map showing total amount of reizigerskilometers (mld)
  createMap(listTotalTrans)
  createBarChart(listProvince, values, data)
});
};

function createMap(listTotalTrans) {
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
  backgroundColor: '#FFFFFF',
  focusOn: {
       x: 0.6,
       y: -0.2,
       scale: 9
  },
  // colour map according to values of listTotalTrans set in totalKm
  series: {
    regions: [{
      values: totalKm,
      scale: ['#C8EEFF', '#0071A4'],
      normalizeFunction: 'polynomial',
      // create legend
      legend: {
          horizontal: true,
          class: 'jvectormap-legend-icons',
          title: 'Total amount of traveller kilometers (mld km)'
      },
    }]
  },
  // show amount of reizigerskilometers (mld km) on hoovering
  onRegionTipShow: function(e, regio, code) {
    regio.html(regio.html()+'; Total traveller kilometers (mld km): '+totalKm[code]+'');
  },
  //show right datachart upon clicking on province
  onRegionClick: function(e, regio, code)
  });

  // set height of svg
  d3.select(".jvectormap-container")
    .select("svg")
    .attr("height", height)

    // set width of svg
    d3.select(".jvectormap-container")
      .select("svg")
      .attr("width", width)
};

function createBarChart(listProvince, values, data) {
  // create variables necessary for svg
  var width = 800;
  var height = 500;
  var barPadding = 0.5;
  var topOfChart = 50;
  var bottomOfChart = 50;
  var leftSideChart = 50;
  var rightSideChart = 50;
  var labelPadding = 40;
  var titlePadding = 30;

  // create a tooltip
  var tool = d3.select("body")
               .append("div")
               .style("position", "absolute")
               .style("text-align", "center")
               .style("width", "100px")
               .style("visibility", "hidden")
               .style("background", "white")
               .style("border", "2px solid yellow")
               .style("border-radius", "5px")
               .style("color", "black");

  // create svg
  var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // get data loaded earlier from values, use province as id
  var dataDict = {};

  // iterate per province
  for (let i = 0; i < listProvince.length; i++) {
    perProvince = {}
    // fill lists per province
    for (object in data[listProvince[i]]) {
      perProvince[data[listProvince[i]][object]["Vervoerwijzen"]] = data[listProvince[i]][object]["Reizigerskilometers (mld km)"]
    };
    dataDict[i] = perProvince;
  };

  // set x and y values
  var xValues = Object.keys(perProvince)
  var yValues = Object.values(perProvince)

  // create scales for axis
  var yScale = d3.scaleLinear()
                 .domain([0, 30])
                 .range([height - bottomOfChart, topOfChart]);
  var xScale = d3.scaleBand()
                 .domain(xValues)
                 .range([leftSideChart, width - rightSideChart]);

  // create axes
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // create bars
  var bars = svg.selectAll("rect")
     .data(yValues)
     .enter()
     .append("rect")
     .attr("fill", "green")
     .attr("width", (width - leftSideChart - rightSideChart) /
           xValues.length - barPadding + "px")
     .attr("y", function(d) {
        var barHeight = yScale(parseFloat(d));
        return barHeight - bottomOfChart + topOfChart + "px";
     })
     .attr("x", function(d, i) {
        return i * (width - leftSideChart - rightSideChart) /
                    xValues.length + leftSideChart + "px";
     })
     .attr("height", function(d) {
        var barHeight = yScale(parseFloat(d));
        return (height - barHeight) - topOfChart + "px";
     })

     // show value of amount of km in mld
     .on("mouseover", function(d){
       d3.select(this)
         .attr("fill", "yellow")
       return (tool.style("visibility", "visible")
                      .text("Value = " + d));

     // return to normal rectangle
     })
     .on("mouseout", function(){
       return (tool.style("visibility", "hidden"),
               bars.attr("fill", "green"));
     })
     .on("mousemove", function(d, i){
       return tool.style("top", event.clientY + "px")
                     .style("left", i * (width - leftSideChart -
                            rightSideChart) / xValues.length +
                            leftSideChart + "px");
     });

  // plot x-axis
  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate("+[0, height - topOfChart]+")")
     .call(xAxis);

  // plot y-axis
  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate("+[leftSideChart, 0]+")")
     .call(yAxis);

  // set x label
  svg.append("text")
      .attr("transform",
            "translate("+[(width - leftSideChart - rightSideChart) / 2 +
                           leftSideChart,
                           height - topOfChart + labelPadding]+")")
      .style("text-anchor", "middle")
      .text("Mode of transport");

  // set y label
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", - height / 2)
      .attr("y", 0)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("amount in mld km");

  // create title
  svg.append("text")
     .attr("x", (width / 2))
     .attr("y", topOfChart - titlePadding)
     .attr("text-anchor", "middle")
     .style("font-size", "20px")
     .style("text-decoration", "bold")
     .text("Distribution mode of transport in the province");
};
