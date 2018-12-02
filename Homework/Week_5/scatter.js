/*
Harmke Vliek
10989137
script for D3 scatter plot:
*/

// request data
var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"

// request data as json file
var requests = [d3.json(womenInScience), d3.json(consConf)];

// define the countries not defined in the dataset
const countries = ["France", "Netherlands", "Portugal", "Germany",
                 "United Kingdom", "Korea"];
const years = ["2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014",
               "2015"];

d3.select("head")
  .append("title")
  .text("D3 bar chart")

d3.select("body")
  .append("h1")
  .text("D3 bar chart")

d3.select("body")
  .append("h3")
  .text("Harmke Vliek")

  d3.select("body")
    .append("h3")
    .text("10989137")

d3.select("body")
  .append("p")
  .text("This scatterplot displays the correlation between\
        the consumer confidence in a specific year and the percentage of\
        women in science ")

d3.select("body")
  .append("h4")
  .text("source: OECD (2018)")

// define variables of the svg
var w = 800;
var h = 400;
var dotPadding = 70;
var xPadding = 50;
var padding = 30

window.onload = function() {
  // request api
  Promise.all(requests).then(function(response) {
      let womenValues = parseData(response[0]);
      let consValues = parseData(response[1]);

      dots = makeDots(womenValues, consValues);
      console.log(requests)
      // create scales
      var xScale = d3.scaleLinear()
                     .domain([calc(womenValues, "min"),
                              calc(womenValues, "max")])
                     .range([xPadding, w - padding])
      var yScale = d3.scaleLinear()
                     .domain([calc(consValues, "min"), calc(consValues, "max")])
                     .range([h-padding, padding]);

      // initialise svg variable
      var svg = d3.select("body")
                  .append("svg")
                  .attr("width", w)
                  .attr("height", h);

      // insert circles
      svg.selectAll("circle")
         .data(dots)
         .enter()
         .append("circle")
         .attr("cx", function(d) {
           console.log(d.women)
           return xScale(d.women);
         })
         .attr("cy", function(d) {
             return yScale(d.cons);
         })
         .attr("r", 5);

      // call x-axis ticks
      svg.append("g")
         .attr("class", "axis")
         .attr("transform", "translate(0," + (h - padding) + ")")
         .call(d3.axisBottom(xScale));

      // call y-axis ticks
      svg.append("g")
         .attr("class", "axis")
         .attr("transform", "translate(" + xPadding + ",0)")
         .call(d3.axisLeft(yScale));

      // create y axis label
      svg.append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", -5)
         .attr("x",0 - (h / 2))
         .attr("dy", "1em")
         .style("text-anchor", "middle")
         .text("consumer confindence");
  });
}

function parseData(data) {
    // the years start at 2007
    // the countries are labeled 0 through 5
    var baseYear = 2007

    var values = []

    // extract the object of country objects
    let countryData = Object.keys(data["dataSets"][0]["series"])

    // loop over each county's observations and create array of data objects
    countryData.forEach(function(i) {
        let obs = Object.keys(data["dataSets"][0]["series"][i]["observations"]);

        // the country 'number' is differently formatted in each dataset
        if (i.length === 3) {
            country = countries[i[2]]
        } else {
            country = countries[i[0]]
        }

        // create datapoints and add them to the values list
        obs.forEach(function(j) {
            let year = (Number(j) + baseYear);
            let value = data["dataSets"][0]["series"][i]["observations"][j][0];
            let dataPoint = {country:country, year:year, value:value};
            values.push(dataPoint);
      })
    })
    return values
}

function makeDots(set1, set2) {
  // combine values in array of arrays
  // use womenValues length because it holds less dates
  // this way there no missing data
  dotList = [];
  for (i in set1) {
      dotList.push({country:set1[i].country, year:set1[i].year,
                    women:set1[i].value, cons:set2[i].value});
  }
  return dotList
}

function calc(set, stat) {
    // calculate a min or max from an array of objects
    stats = [];
    for (i in set) {
      stats.push(set[i].value)
    }
    if(stat === "max") {
        return Math.max.apply(null, stats)
    } else {
        return Math.min.apply(null, stats)
    }
}
