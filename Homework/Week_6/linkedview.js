/*
Harmke Vliek
10989137
script for D3 linked views
Use of external library jvectormap for map
The bar chart has no x label, as I thought it was clear enough as it is.
*/

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
  createMap(listTotalTrans, listProvince, values, data)
  // createBarChart(listProvince, values, data)
});
};

function createMap(listTotalTrans, listProvince, values, data) {
  // create variables necessary for svg
  var titlePadding = 30;
  var topOfChart = 350;
  var height = 400;
  var width = 900;

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
  title: 'Total amount of traveller km per province',
  backgroundColor: '#FFFFFF',
  focusOn: {
       x: 2,
       y: -0.2,
       scale: 7
  },
  // colour map according to values of listTotalTrans set in totalKm
  series: {
    regions: [{
      values: totalKm,
      scale: ['#C8EEFF', '#0071A4'],
      normalizeFunction: 'polynomial',
    }]
  },
  // show amount of reizigerskilometers (mld km) on hoovering
  onRegionTipShow: function(e, regio, code) {
    regio.html(regio.html() +'. Total traveller kilometers (mld km): '+totalKm[code]+'');
  },
  //show right datachart upon clicking on province
  onRegionClick: function(e, regio, code) {
    createBarChart(listProvince, values, data, regio)
  }
  });

  // linear gradient legend
  var divWidth = 100;
  var svg = d3.select("#legend")
  var mapDim = svg.node().getBoundingClientRect();
  var mapHeight = mapDim.height;
  var mapWidth = mapDim.width;
  var defs = svg.append("defs");
  var legendWidth = divWidth * 0.3;
  var legendHeight = 12;

  // linear gradient specification
  var linearGradient = defs.append("linearGradient")
                           .attr("id", "linear-gradient")
                           .attr("x1", "0%")
                           .attr("y1", "0%")
                           .attr("x2", "100%")
                           .attr("y2", "0%");

  // beginning of legend is lightblue
  linearGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#C8EEFF");

  // linear gradient continues with darker blue
  linearGradient.append("stop")
                .attr("offset", "5%")
                .attr("stop-color", "#0071A4");

  // to dark blue-grey which represents the max value
  linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#37474F");

  // color legend container
  var legendsvg = svg.append("g")
                     .attr("class", "legendWrapper")
                     .attr("transform", "translate(" + (divWidth / 2 - 10) + "," + (mapHeight - 50) + ")");

  // draw linear gradient rectangle
  legendsvg.append("rect")
            .attr("class", "legendRect")
            .attr("x", -legendWidth / 2)
            .attr("y", 10)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#linear-gradient)");

  // legend title
  legendsvg.append("text")
           .attr("class", "legendTitle")
           .style("fill", "#0071A4")
           .style("font-size", "0.9em")
           .style("text-anchor", "middle")
           .attr("x", 0)
           .text("Amount of kilometers");

   // assign axis class and position in the middle of the gradient bar
   legendsvg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + (-legendWidth / 2) + "," + (10 + legendHeight) + ")");

   // set scale for x axis
   var xScale = d3.scaleLinear()
                  .range([0, legendWidth])
                  .domain([0, 40]);

   // specify axis properties
   var xAxis = d3.axisBottom()
                 .tickPadding(17)
                 .ticks(5)
                 .tickSize(0)
                 .tickFormat(d3.format(".0f"))
                 .scale(xScale);

   // add the x axis to svg
   legendsvg.append("g")
            .attr("class", "legendAxis")
            .attr("x", 200)
            .attr("y", 200)
            .call(xAxis);

  // create title
  var svg2 = d3.select("#title")

  svg2.append("text")
      .attr("x", (width / 2))
      .attr("y", topOfChart - titlePadding)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("text-decoration", "bold")
      .text("Total amount of traveller km per province");

  // set height of svg
  d3.select(".jvectormap-container")
    .select("svg")
    .attr("height", height)

    // set width of svg
    d3.select(".jvectormap-container")
      .select("svg")
      .attr("width", width)
};

function createBarChart(listProvince, values, data, regio) {
  // create variables necessary for svg
  var width = 500;
  var height = 500;
  var barPadding = 0.5;
  var topOfChart = 50;
  var bottomOfChart = 50;
  var leftSideChart = 50;
  var rightSideChart = 50;
  var labelPadding = 40;
  var titlePadding = 30;

  // create a tooltip
  var tool = d3.select("#barChart")
               .append("div")
               .style("position", "absolute")
               .style("text-align", "center")
               .style("width", "100px")
               .style("visibility", "hidden")
               .style("background", "white")
               .style("border", "2px solid pink")
               .style("border-radius", "5px")
               .style("color", "black");

  // make sure there is only one barchart at the time
  if (d3.select("#barSVG")) {
    d3.select("#barSVG").remove().exit();
  };

  // create svg
  var svg = d3.select("#barChart")
    .append("svg")
    .attr("id", "barSVG")
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
    dataDict[listProvince[i]] = perProvince;
  };

  // set x and y values
  var xValues = Object.keys(dataDict[tt[regio]])
  var yValues = Object.values(dataDict[tt[regio]])

  // create scales for axis
  var yScale = d3.scaleLinear()
                 .domain([0, 40])
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
     .attr("fill", "blue")
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
         .attr("fill", "pink")
       return (tool.style("visibility", "visible")
                      .text("Value = " + d));
     })
     // return to normal rectangle
     .on("mouseout", function(){
       return (tool.style("visibility", "hidden"),
               bars.attr("fill", "blue"));
     })
     .on("mousemove", function(d, i){
       return tool.style("top", event.clientY - 40 + "px")
                  .style("left", event.clientX + "px");
    })

  // plot x-axis
  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate("+[0, height - topOfChart]+")")
     .call(xAxis)
     .selectAll("text")
     .style("text-anchor", "end")
     .attr("font-size", "8px")
     .attr("dx", "-.5em")
     .attr("dy", ".8em")
     .attr("transform", "rotate(-25)");

  // plot y-axis
  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate("+[leftSideChart, 0]+")")
     .call(yAxis);

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
     .text("Distribution mode of transport in " + tt[regio]);
};
