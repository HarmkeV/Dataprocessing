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
var yPadding = 50;
var padding = 40;
var titlePadding = 20;
var topOfChart = 50;
var bottomOfChart = 50;
var leftSideChart = 50;
var rightSideChart = 50;
var colors = ['#f6eff7','#bdc9e1','#67a9cf','#1c9099','#016c59']

window.onload = function() {
  // request data
  var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
  var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"
  var gdpCapita = "https://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.RGDP_INDEX.A/all?startTime=2007&endTime=2015"

  // request data as json file
  var requests = [d3.json(womenInScience), d3.json(consConf), d3.json(gdpCapita)];

  // request api
  Promise.all(requests).then(function(response) {
    // indicate countries
    // for (index in response[0]["structure"]["dimensions"]["series"][1]["values"]) {
    //   countries.push(response[0]["structure"]["dimensions"]["series"][1]["values"][index].name)
    // }
    // // indicate years
    // for (index in response[0]["structure"]["dimensions"]["observation"][0]["values"]) {
    //   years.push(response[0]["structure"]["dimensions"]["observation"][0]["values"][index].name)
    // }

    var womenValues = parseData(response[0]);
    var consValues = parseData(response[1]);
    var gdpValues = parseData(response[2]);

    d3.select("#selectSet")
      .on("input", function() {
          update(womenValues, consValues, this.value)
    })

    firstSet = "France"

    // select the proper country from each parsed dataset
    selectSetA = womenValues[countriesA.indexOf(firstSet)][firstSet]
    selectSetB = consValues[countriesB.indexOf(firstSet)][firstSet]
    selectSetC = gdpValues[countriesA.indexOf(firstSet)][firstSet]

    // create array for gdp so it can fill the points
    gdpList = [];
    for (index in selectSetC) {
      gdpList.push(selectSetC[index][years[index]])
    }
    console.log(consValues)
    console.log(womenValues)
    // create the points meant to be in the plot
    points = createPoint(selectSetA, selectSetB);

    // create scales
    // createScale(selectSetA, selectSetB, selectSetC);

    // initialise svg variable
    var svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

   // set begin graph
   createGraph(womenValues, consValues, svg)
});

function parseData(data) {
  // check if data is formatted right
  if (data.structure.dimensions.series.length === 2) {
    formatted = 1
    dataSet = 0
    window.countriesA = [];
  } else if (data.structure.dimensions.series.length === 4) {
    formatted = 1
    dataSet = 0
    window.countriesC = [];
  } else {
    formatted = 0
    dataSet = 1
    window.countriesB = [];
  }

  // retrieve the countries from the dataset
  countryIndex = Object.keys(data.structure.dimensions.series[formatted].values)
  countryIndex.forEach(function(i) {
    if (formatted === 1) {
        countriesA.push(data.structure.dimensions.series[formatted].values[i].name)
    } else {
        countriesB.push(data.structure.dimensions.series[formatted].values[i].name)
    }
  })
  window.years = [];

  // retrieve the years from the dataset
  yearData = Object.keys(data.structure.dimensions.observation[0].values)
  yearData.forEach(function(d) {
    years.push(data.structure.dimensions.observation[0].values[d].id)
  })

  var dataValues = [];

  // extract the object of country objects
  var countryData = Object.keys(data.dataSets[0].series)

  // loop over each county's observations and create array of data objects
  countryData.forEach(function(i) {
      var obs = Object.keys(data.dataSets[0].series[i].observations);

      // the country 'number' is differently formatted in each dataset
      if (i.length === 3) {
          country = countriesA[i[2]]
      } else {
          country = countriesB[i[0]]
      }

      // make new list
      var countryList = [];
      // create datapoints to add to the valuelist at index h (years)
      obs.forEach(function(h) {
          var year = years[h];
          var value = data.dataSets[0].series[i].observations[h][0];
          countryList.push({[years[h]]:value})
      })
      dataValues.push({[country]:countryList})
  })
  return dataValues
}


function calc(dataSet, stat, year) {
    // calculate a min or max from an array of objects
    statistics = [];
    for (index in dataSet) {
      Object.values(dataSet[index])[0].forEach(function(t){
        if (Object.keys(t)[0] == year){
          statistics.push(Object.values(t)[0])
        }
      })

    }
    if(stat === "max") {
        return Math.max.apply(null, statistics)
    } else {
        return Math.min.apply(null, statistics)
    }
}


function createGraph(womenValues,consValues, svg) {
  // create scales
  var xScale = d3.scaleLinear()
                 .domain([calc(womenValues, "min") - 1, calc(womenValues, "max") + 1])
                 .range([xPadding, width - padding])
  var yScale = d3.scaleLinear()
                 .domain([calc(consValues, "min") -1 , calc(consValues, "max") + 1])
                 .range([height - padding, padding]);
  var colorScale = d3.scaleQuantize()
                     .domain([calc(womenValues, "min"), calc(womenValues, "max")])
                     .range(colors)

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
       .data(years)
       .enter()
       .append("circle")
       .attr("cx", function(d) {
             return xScale(points[d][0]);
       })
       .attr("cy", function(d) {
             return yScale(points[d][1]);
       })
       .attr("r", 4)
       .attr("stroke-opacity", .4)
       .attr("stroke", "black")
       .attr("fill", function(d, i) {
         return colorScale(selectSetC[i][String(d)])
       });

       // create the labels for years
        var labels = svg.selectAll("text")
                       .data(years)
                       .enter()
                       .append("text")
                       .text(function(d) { return d; })
                       .attr("x", function(d) {
                          return xScale(points[d][0]) + 5;
                       })
                       .attr("y", function(d) {
                          return yScale(points[d][1]);
                       })
                       .attr("class", "tag")

       // draw country name atop graph
       svg.selectAll(".country")
          .data(defaultInput)
          .enter()
          .append("text")
          .attr("x", 20)
          .attr("y", 20)
          .attr("class", "country")
          .text(firstSet)

     // creat the legend
     var svg = d3.select("svg")

     // select space to draw legend
     svg.append("g")
        .attr("class", "legendClass")
        .attr("transform", "translate(855,200)")

     // create legend object
     var legend = d3.legendColor()
                     .labelFormat(d3.format(".2f"))
                     .title("GDP per capita")
                     .shapePadding(5)
                     .shapeWidth(40)
                     .shapeHeight(15)
                     .labelOffset(10)
                     .titleWidth(90)
                     .scale(colorlScale)

     // draw the legend
     svg.select(".legendClass")
       .call(legend);
};


function createPoint(setWomen, setCons) {
  // combine values in a list to find x,y coordinates
  pointList = {};
  console.log(setCons)
  for (index in setWomen) {
    year = Object.keys(setWomen[index])[0]
    console.log("eerste for")
    for (l in setCons) {
      console.log(Object.keys(setCons[l])[0])
        // just use years contained in both sets
        // if (Object.keys(setWomen[index])[0] === Object.keys(setCons[l])[0]) {
        //     pointList[year] = [setWomen[index][Object.keys(setWomen[index])[0]],
        //                      setCons[l][Object.keys(setCons[l])[0]]]}
                             console.log("if please")
        }
      }
  return pointList
}


function updateGraph(womenValues, consValues, gdpValues, indicatedInput) {
    /* updates data to a selected country */

    newValuesWomen = womenValues[countries1.indexOf(indicatedInput)][indicatedInput]
    newValuesCons = consValues[countries2.indexOf(indicatedInput)][indicatedInput]
    newValuesGDP = gdpValues[countries1.indexOf(indicatedInput)][indicatedInput]

    // calculate new dots
    newPoint = createPoint(newValuesWomen, newValuesCons)

    // calculate new scale
    createScale(newValuesWomen, newValuesCons, newValuesGDP);

    // select data to change
    var svg = d3.select("body");

    // make changes
    svg.selectAll(".normal")
            .data(years)
            .transition()
            .duration(750)
            .attr("cx", function(d) {
                if (newPoint.hasOwnProperty(String(d))) {
                    return xScale(newPoint[d][0])
                } else {
                    return 2000
                }
            })
            .attr("cy", function(d) {
                if (newPoint.hasOwnProperty(String(d))) {
                    return yScale(newPoint[d][1])
                } else {
                    return 2000
                }
            })
            .style("fill", function(d, i) {
               return colorScale(newValuesGDP[i][String(d)])
            });

    // update axes
    svg.selectAll(".xaxis")
       .attr("transform", "translate(0," + (height - padding) + ")")
       .call(xScale)

    svg.selectAll(".yaxis")
       .attr("transform", "translate(" + xPadding + ",0)")
       .call(yScale)


    // update tags
    svg.selectAll(".tag")
       .data(years)
       .transition()
       .duration(750)
       .attr("x", function(d) {
           if (newPoint.hasOwnProperty(String(d))) {
               return xScale(newPoint[d][0]) + 5
           } else {
               return 2000
           }
       })
       .attr("y", function(d) {
           if (newPoint.hasOwnProperty(String(d))) {
               return yScale(newPoint[d][1])
           } else {
               return 2000
           }
       })

    // update the legend with a new scale
    var legend = d3.legendColor()
                   .labelFormat(d3.format(".2f"))
                   .title("GDP per capita")
                   .shapePadding(5)
                   .shapeWidth(40)
                   .shapeHeight(15)
                   .labelOffset(10)
                   .titleWidth(90)
                   .scale(colorScale)

    // draw the legend
    svg.select(".legendClass")
       .call(legend);

    // update country name atop graph
    svg.selectAll(".country")
       .text(indicatedInput)
}
}
