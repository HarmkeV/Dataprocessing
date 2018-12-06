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
var countryPadding = 50;
var titlePadding = 20;
var topOfChart = 50;
var bottomOfChart = 50;
var leftSideChart = 50;
var rightSideChart = 50;
var colours = ['#f6eff7','#bdc9e1','#67a9cf','#1c9099','#016c59']

window.onload = function() {

  var womenInScience = "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
  var consConf = "https://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"
  var unemployment = "https://stats.oecd.org/SDMX-JSON/data/KEI/LR+LRHUTTTT.FRA+DEU+KOR+NLD+PRT+GBR.ST.A/all?startTime=2007&endTime=2015"

  var requests = [d3.json(womenInScience), d3.json(consConf), d3.json(unemployment)];

  // request api
  Promise.all(requests).then(function(response) {
      let womValues = dataParser(response[0]);
      let conValues = dataParser(response[1]);
      let empValues = dataParser(response[2]);

      d3.select("#userInput").on("input", function() {
        update(womValues, conValues, empValues, this.value)
      })

      beginSet = "France"

      // select the proper country from each parsed dataset
      setSelectA = womValues[countriesA.indexOf(beginSet)][beginSet]
      setSelectB = conValues[countriesB.indexOf(beginSet)][beginSet]
      setSelectC = empValues[countriesA.indexOf(beginSet)][beginSet]

      // instead of creating dots for the unemployment, create a simple array
      unemploymentList = [];
      for (index in setSelectC) {
        unemploymentList.push(setSelectC[index][years[index]])
      }

      // create the dots to be plotted in the scatterplot
      points = createPoint(setSelectA, setSelectB);

      // create scales
      setScale(setSelectA, setSelectB, setSelectC);

      // initialise svg variable
      var svg = d3.select("body")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);

      // insert circles
      var circles = svg.selectAll("circle")
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
                       .style("fill", function(d, i) {
                          return colourScale(setSelectC[i][String(d)])
                       })
                       .attr("class", "normal");

      // create the tags for the years
      var tags = svg.selectAll("text")
                     .data(years)
                     .enter()
                     .append("text")
                     .text(function(d) { return d; })
                     .attr("x", function(d) {
                        return xScale(points[d][0]) + 10;
                     })
                     .attr("y", function(d) {
                        return yScale(points[d][1]);
                     })
                     .attr("class", "tag")

      // draw country name atop graph
      svg.selectAll(".country")
         .data(beginSet)
         .enter()
         .append("text")
         .attr("x", width / 2)
         .attr("y", 0 + countryPadding)
         .style("font-size","16px")
         .attr("class", "country")
         .text(beginSet)

      // create dropdown button
      var data = ["France", "Germany", "Portugal", "United Kingdom", "Korea", "Netherlands"];

      var select = d3.select('body')
                     .append('select')
        	           .attr('class','select')
                     .on('change',onchange)

      var options = select
        .selectAll('option')
      	.data(data).enter()
        .append('option')
        .text(function (d) { return d; });

      function onchange() {
      	selectValue = d3.select('select')
                        .property('value')

        // select the indicated country from each parsed dataset
        setSelectA = womValues[countriesA.indexOf(selectValue)][selectValue]
        setSelectB = conValues[countriesB.indexOf(selectValue)][selectValue]
        setSelectC = empValues[countriesA.indexOf(selectValue)][selectValue]

        // update graph
        updateGraph(setSelectA, setSelectB, setSelectC, selectValue)
      };

      // draw the scales for the graph
      drawScales(svg);

      // create the legend
      var svg = d3.select("svg")

      // select space to draw legend
      svg.append("g")
         .attr("class", "legendClass")
         .attr("transform", "translate(660, 290)")
         .style("font-size","9px")

      // create legend object
      var legenda = d3.legendColor()
                      .labelFormat(d3.format(".2f"))
                      .title("Uneployment in percentages")
                      .shapePadding(5)
                      .shapeWidth(40)
                      .shapeHeight(15)
                      .labelOffset(12)
                      .titleWidth(90)
                      .scale(colourScale)

      // draw the legend
      svg.select(".legendClass")
        .call(legenda);
  });
}

function dataParser(data) {
    // declare global year and country list for user selection
    // create separate lists since the countries in the
    // datasets are formatted differently

    // the datasets are formatted differently, so check for proper formatting
    if (data.structure.dimensions.series.length === 2) {
      // womenInScience
      framing = 1
      window.countriesA = [];
    } else if (data.structure.dimensions.series.length === 4) {
      // unemployment
      framing = 1
    } else {
      // consumerConfidence
      framing = 0
      window.countriesB = [];
    }

    // retrieve the countries from the dataset
    countryIndex = Object.keys(data.structure.dimensions.series[framing].values)
    countryIndex.forEach(function(i) {
      if (framing === 1) {
          countriesA.push(data.structure.dimensions.series[framing].values[i].name)
      } else {
          countriesB.push(data.structure.dimensions.series[framing].values[i].name)
      }
    })

    // create global year array for future use
    window.years = [];

    // retrieve the years from the dataset
    yearData = Object.keys(data.structure.dimensions.observation[0].values)
    yearData.forEach(function(i) {
      years.push(data.structure.dimensions.observation[0].values[i].id)
    })
    var dataValues = [];

    // extract the object of country objects
    let countryData = Object.keys(data.dataSets[0].series)

    // loop over each county's observations and create array of data objects
    countryData.forEach(function(i) {
        let observations = Object.keys(data.dataSets[0].series[i].observations);

        // the country 'number' is differently formatted in each dataset
        if (i.length === 3 || i.length === 7) {
            country = countriesA[i[2]]
        } else {
            country = countriesB[i[0]]
        }

        // create emty country datalist
        var countryKeys = [];
        // create datapoints and add them to the values list //j is year index
        observations.forEach(function(j) {
            var year = years[j];
            var value = data.dataSets[0].series[i].observations[j][0];
            countryKeys.push({[years[j]]:value})
        })
        dataValues.push({[country]:countryKeys})
    })
    return dataValues
}

function createPoint(setWomen, setCons) {
  /* combine values in array of objects */
  pointList = {};
  for (index in setWomen) {
      year = Object.keys(setWomen[index])[0]
      for (j in setCons) {

          // only use years if both datasets have them
          if (Object.keys(setWomen[index])[0] === Object.keys(setCons[j])[0]) {
              pointList[year] = [setWomen[index][Object.keys(setWomen[index])[0]],
                               setCons[j][Object.keys(setCons[j])[0]]]}
          }
      }
  return pointList
}

function setScale(setWomen, setCons, setEmp) {
  /* create scale for x, y and third variable*/
  window.xScale = d3.scaleLinear()
                 .domain([calc(setWomen, "min") - 1,
                          calc(setWomen, "max") + 1])
                 .range([xPadding, width - padding]);
  window.yScale = d3.scaleLinear()
                 .domain([calc(setCons, "min") - 1,
                          calc(setCons, "max") + 1])
                 .range([height - padding, padding]);
  window.colourScale = d3.scaleQuantize()
                         .domain([calc(setEmp, "min"),
                                  calc(setEmp, "max")])
                         .range(colours)
}

function calc(dataSet, stat) {
    /* calculate a min or max from an array of objects */
    statistics = [];
    for (index in dataSet) {
      statistics.push(dataSet[index][Object.keys(dataSet[index])])
    }
    if(stat === "max") {
        return Math.max.apply(null, statistics)
    } else {
        return Math.min.apply(null, statistics)
    }
}

function drawScales(svg) {
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
}


function updateGraph(womValues, conValues, empValues, selectedCountry) {
    // calculate new dots
    newPoint = createPoint(womValues, conValues)

    // calculate new scale
    setScale(womValues, conValues, empValues);

    // select data to change
    var svg = d3.select("body");

    // make changes
    svg.selectAll(".normal")
            .data(years)
            .transition()
            .duration(500)
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
               return colourScale(empValues[i][String(d)])
            });

    // update tags
    svg.selectAll(".tag")
       .data(years)
       .transition()
       .duration(500)
       .attr("x", function(d) {
           if (newPoint.hasOwnProperty(String(d))) {
               return xScale(newPoint[d][0]) + 10
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
    var legenda = d3.legendColor()
                    .labelFormat(d3.format(".2f"))
                    .title("Uneployment rate")
                    .shapePadding(5)
                    .shapeWidth(40)
                    .shapeHeight(15)
                    .labelOffset(12)
                    .titleWidth(90)
                    .scale(colourScale)

    // draw the legend
    svg.select(".legendClass")
       .call(legenda);

    // update country name atop graph
    svg.selectAll(".country")
       .text(selectedCountry);

   svg.selectAll(".xaxis")
      .transition()
      .duration(500)
      .call(d3.axisBottom(xScale));

   svg.selectAll(".yaxis")
      .transition()
      .duration(500)
      .call(d3.axisLeft(yScale));
}
