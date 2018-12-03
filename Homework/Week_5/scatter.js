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
var countries = ["France", "Netherlands", "Portugal", "Germany",
                 "United Kingdom", "Korea"];
var years = ["2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014",
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

window.onload = function() {
  // request api
  Promise.all(requests).then(function(response) {
      let womenValues = parseData(response[0]);
      let consValues = parseData(response[1]);

      points = createPoint(womenValues, consValues);

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

      // initialise svg variable
      var svg = d3.select("body")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);

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
         .attr("fill", function(d) {
               return colorScale(d.women)
         })

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

        // create legend
        //legend = svg.append("g")
          //          .attr("class","legend")
            //        .attr("transform","translate(50,30)")
              //      .style("font-size","12px")
                //    .call(d3.legend)
  });
}

function parseData(data) {
    // parse the data requested in promise function
    var startYear = 2007
    var values = []

    // take the object of country objects
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
            let year = (Number(j) + startYear);
            let value = data["dataSets"][0]["series"][i]["observations"][j][0];
            let dataPoint = {country:country, year:year, value:value};
            values.push(dataPoint);
      })
    })
    return values
}

function createPoint(setWomen, setCons) {
  // combine values in array of arrays
  // use womenValues length because it holds less dates
  // this way there no missing data
  pointList = [];
  for (index in setWomen) {
      pointList.push({country:setWomen[index].country, year:setWomen[index].year,
                    women:setWomen[index].value, cons:setCons[index].value});
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
