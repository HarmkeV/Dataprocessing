/*
Harmke Vliek
10989137
script for D3 scatter plot:
*/

// define variables of the svg
var width = 800;
var height = 450;
var pointPadding = 60;
var xPadding = 50;
var padding = 40;
var titlePadding = 20;
var topOfChart = 50;
var bottomOfChart = 50;
var leftSideChart = 50;
var rightSideChart = 50;

// set parameters and margin for legend
  var margin = {
    left: 60,
    right: 200,
    top: 60,
    bottom: 60
  };
  var parameters = {
    height: 450,
    width: 1000
  };

window.onload = function() {
  // request data
  var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
  var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"
  var gdpCapita = "https://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.RGDP_INDEX.A/all?startTime=2007&endTime=2015"

  // request data as json file
  var requests = [d3.json(womenInScience), d3.json(consConf), d3.json(gdpCapita)];

  // create lists for coutries and years
  countries = []
  years = []

  // request api
  Promise.all(requests).then(function(response) {
    // indicate countries
    for (index in response[0]["structure"]["dimensions"]["series"][1]["values"]) {
      countries.push(response[0]["structure"]["dimensions"]["series"][1]["values"][index].name)
    }
    // indicate years
    for (index in response[0]["structure"]["dimensions"]["observation"][0]["values"]) {
      years.push(response[0]["structure"]["dimensions"]["observation"][0]["values"][index].name)
    }

    var womenValues = parseData(response[0]);
    var consValues = parseData(response[1]);
    var gdpValues = parseData(response[2]);

    beginSet = "France"
    selectWomen = womenValues[countries.indexOf(beginSet)][beginSet]
    selectCons = consValues[countries.indexOf(beginSet)][beginSet]

    points = createPoint(selectWomen, selectCons);

    d3.select("#userInput")
      .on("input", function() {
          update(womenValues, consValues, this.value)
    })

    // initialise svg variable
    var svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

   // set axes
   createGraph(womenValues, consValues, svg)
});

function parseData(data) {
  // create new lists for countries
  countries1 = []
  countries2 = []

  // check if data is formatted right
  if (data.structure.dimensions.series.length === 2) {
    formatted = 1
    dataSet = 0
    window.countries1 = [];
  } else if (data.structure.dimensions.series.length === 4) {
    formatted = 1
    dataSet = 0
    window.countries3 = [];
  } else {
    formatted = 0
    dataSet = 1
    window.countries2 = [];
  }

  // retrieve the countries from the dataset
  countryIndex = Object.keys(data.structure.dimensions.series[formatted].values)
  countryIndex.forEach(function(i) {
    if (formatted === 1) {
        countries1.push(data.structure.dimensions.series[formatted].values[i].name)
    } else {
        countries2.push(data.structure.dimensions.series[formatted].values[i].name)
    }
  })
  window.years = [];

  // retrieve the years from the dataset
  yearData = Object.keys(data.structure.dimensions.observation[0].values)
  yearData.forEach(function(d) {
    years.push(data.structure.dimensions.observation[0].values[d].id)
  })

  var values = [];

  // extract the object of country objects
  var countryData = Object.keys(data.dataSets[0].series)

  // loop over each county's observations and create array of data objects
  countryData.forEach(function(i) {
      var obs = Object.keys(data.dataSets[0].series[i].observations);

      // the country 'number' is differently formatted in each dataset
      if (i.length === 3) {
          country = countries1[i[2]]
      } else {
          country = countries2[i[0]]
      }

      // make new list
      var countryList = [];
      // create datapoints to add to the valuelist at index h (years)
      obs.forEach(function(h) {
          var year = years[h];
          var value = data.dataSets[0].series[i].observations[h][0];
          countryList.push({[years[h]]:value})
      })
      values.push({[country]:countryList})
  })
  return values
}

function createGraph(womenValues,consValues, svg) {
  // create scales
  var xScale = d3.scaleLinear()
                 .domain([calc(womenValues, "min"),
                          calc(womenValues, "max")])
                 .range([xPadding, width - padding])
  var yScale = d3.scaleLinear()
                 .domain([calc(consValues, "min"), calc(consValues, "max")])
                 .range([height-padding, padding]);
  var colorScale = d3.scaleQuantize()
                     .domain([calc(womenValues, "min"),
                              calc(womenValues, "max")])
                     .range(['#f6eff7','#bdc9e1','#67a9cf','#1c9099','#016c59'])

  // create x axis ticks
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (height - padding) + ")")
    .call(d3.axisBottom(xScale));

  // create y axis ticks
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + xPadding + ",0)")
    .call(d3.axisLeft(yScale));

  // create y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -5)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("consumer confindence");

    // create x axis label
    svg.append("text")
        .attr("transform",
              "translate("+[(width - leftSideChart - rightSideChart) / 2 +
                             leftSideChart,
                             height - topOfChart + padding]+")")
        .style("text-anchor", "middle")
        .text("percentage of women in science");

   // create title
   svg.append("text")
      .attr("x", (width / 2))
      .attr("y", topOfChart - titlePadding)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("text-decoration", "bold")
      .text("scatterplot regarding women in science and consumer confidence");

    // insert points
    svg.selectAll("circle")
       .data(points)
       .enter()
       .append("circle")
       .attr("cx", function(d) {
             return xScale(d.women);
       })
       .attr("cy", function(d) {
             return yScale(d.cons);
       })
       .attr("r", 4)
       .attr("stroke-opacity", .4)
       .attr("stroke", "black")
       .attr("fill", function(d) {
             return colorScale(d.gdp)
       });

    // create legend
    // create color legend
    var colorLegend = d3.legendColor()
                        .labelFormat(d3.format(".0f"))
                        .scale(scales[2])
                        .shapePadding(5)
                        .shapeWidth(50)
                        .shapeHeight(20)
                        .labelOffset(12);

    // add legend to chart
    svg.append("g")
       .attr("id", "colorLegend")
       .attr("transform", "translate("+[param.width + margin.left,
                                        margin.top]+")")
       .call(colorLegend);

    // color legend label
    svg.append("text")
       .attr("transform", "translate("+[param.width + 5 * margin.left / 2,
                                        margin.top / 2]+")")
       .style("text-anchor", "middle")
       .text(data[2][2]);

    // size legend (code recycled from source https://d3-legend.susielu.com/#size)
    var legendSize = d3.legendSize()
                       .scale(scales[3])
                       .shape('circle')
                       .labelOffset(20)
                       .orient('vertical');

     svg.append("g")
        .attr("class", "legendSize")
        .attr("transform", "translate("+[param.width + 2 * margin.left,
                                         param.height / 2 + 3 * margin.top / 2]+")")
        .call(legendSize);

    // size legend label
    svg.append("text")
       .attr("transform", "translate("+[param.width + 5 * margin.left / 2,
                                        2 * param.height / 3]+")")
       .style("text-anchor", "middle")
       .text(data[2][3]);
};

     //var labels = svg.selectAll("text")
                // .data(years)
                // .enter()
                // .append("text")
                // .text(function(d) { return d; })
                // .attr("x", function(d) {
                //    return xScale(points[d][0]) + 10;
                // })
                // .attr("y", function(d) {
                //    return yScale(points[d][1]);
                // })
};

function createPoint(setWomen, setCons, svg) {
  /* combine values in array of objects */
  pointList = {};
  for (index in setWomen) {
      year = Object.keys(setWomen[index])[0]
      for (location in setCons) {

          // only use years if both datasets have them
          if (Object.keys(setWomen[index])[0] === Object.keys(setCons[location])[0]) {
              pointList[year] = [setWomen[index][Object.keys(setWomen[index])[0]],
                               setCons[location][Object.keys(setCons[location])[0]]]}
          }
      }
  return pointList
}

function calc(dataSet, stat) {
    // calculate a min or max from an array of objects
    statistics = [];
    for (index in dataSet) {
      statistics.push(dataSet[index].value)
    }
    if(stat === "max") {
        return Math.max.apply(null, statistics)
    } else {
        return Math.min.apply(null, statistics)
    }
}

function updateGraph(womenValues, consValues, selection, svg) {

    newValuesWomen = womenValues[countries1.indexOf(selection)][selection]
    newValuesCons = consValues[countries2.indexOf(selection)][selection]

    // set new dots
    newPoints = createPoint(newValuesWomen, newValuesCons)

    // set new scale
    createScale(newValuesWomen, newValuesCons);

    svg.selectAll(".normal")
            .data(years)
            .transition()
            .duration(750)
            .attr("cx", function(d) {
                if (newPoints.hasOwnProperty(String(d))) {
                    return xScale(newPoints[d][0])
                } else {
                    return 2000
                }
            })
            .attr("cy", function(d) {
                if (newPoints.hasOwnProperty(String(d))) {
                    return yScale(newPoints[d][1])
                } else {
                    return 2000
                }
            })

    // update labels
    svg.selectAll(".tag")
       .data(years)
       .transition()
       .duration(500)
       .attr("x", function(d) {
           if (newPoints.hasOwnProperty(String(d))) {
               return xScale(newPoints[d][0]) + 10
           } else {
               return 2000
           }
       })
       .attr("y", function(d) {
           if (newPoints.hasOwnProperty(String(d))) {
               return yScale(newPoints[d][1])
           } else {
               return 2000
           }
       })
}
