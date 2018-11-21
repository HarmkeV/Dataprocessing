// Harmke Vliek
// 10989137
// JavaScript code for linegraph.html

function createTransform(domain, range){
  // domain is a two-element array of the data bounds [domain_min, domain_max]
  // range is a two-element array of the screen bounds [range_min, range_max]
  // this gives you two equations to solve:
  // range_min = alpha * domain_min + beta
  // range_max = alpha * domain_max + beta
  // a solution would be:

  var domain_min = domain[0]
  var domain_max = domain[1]
  var range_min = range[0]
  var range_max = range[1]

  // formulas to calculate the alpha and the beta
  var alpha = (range_max - range_min) / (domain_max - domain_min)
  var beta = range_max - alpha * domain_max

  // returns the function for the linear transformation (y= a * x + b)
  return function(x){
  return alpha * x + beta;
  }
}

var fileName = "data.json";
var txtFile = new XMLHttpRequest();

// declare variables for x,y positions of graph
var GRAPH_TOP = 25;
var GRAPH_BOTTOM = 300;
var GRAPH_LEFT = 10;
var GRAPH_RIGHT = 600;

txtFile.onreadystatechange = function() {
    if (txtFile.readyState === 4 && txtFile.status == 200) {
        var data = JSON.parse(txtFile.responseText);

        // create list to save the keys (years)
        years = Object.keys(data);
        // create list for values sorted based on years
        values = [];

        // take years as index, add values of pebua to values
        years.forEach(function(element) {
          values.push(data[element]['Projected Emissions - Business As Usual'])
        })

      var outGr = outlineGraph()
      var coordinateList = coordinates(outGr)
      var lines = drawLines(coordinateList)
      var tick = ticks(lines)
      layout(coordinateList, lines, tick)
    }
}
txtFile.open("GET", fileName);
txtFile.send();

function outlineGraph(){
  var canvas = document.getElementById( "canvas" );
  var context = canvas.getContext( "2d" );

  // clear canvas (if another graph was previously drawn)
  context.clearRect( 0, 0, 500, 400 );

  // draw X and Y axis
  context.beginPath();
  context.moveTo( GRAPH_LEFT, GRAPH_BOTTOM );
  context.lineTo( GRAPH_RIGHT, GRAPH_BOTTOM );
  context.lineTo( GRAPH_RIGHT, GRAPH_TOP );
  context.stroke();
}

function coordinates(outGr){
  // call createTransform
  // find x coordinate
  domain = [2006, 2020];
  range = [GRAPH_LEFT, GRAPH_RIGHT];

  xList = [];
  xCord = createTransform(domain, range);
  for (var posYear = 0; posYear < 15; posYear++) {
    xList.push(xCord(years[posYear]));
  }

  // find y coordinates
  domain = [100000000, 141000000];
  range = [GRAPH_BOTTOM, GRAPH_TOP];

  yList = [];
  yCord = createTransform(domain, range);
  for (var posValue = 0; posValue < 15; posValue++) {
    yList.push(yCord(values[posValue]));
  }

  // find y axis label coordinates
  domain = [100000000, 141000000];
  range = [GRAPH_BOTTOM, GRAPH_TOP];

  yaxList = [];
  var yAxisValues = [100000000, 110000000, 120000000, 130000000, 140000000];
  yaxCord = createTransform(domain, range);
  for (var posYAx = 0; posYAx < 5; posYAx++) {
    yaxList.push(yaxCord(yAxisValues[posYAx]));
  }

  return xList, yList, yaxList
}

function drawLines(outGr, coordinateList){
  /// draw reference lines
  context.beginPath();
  // set light grey color for reference lines
  context.strokeStyle = "#BBB";
  context.moveTo( GRAPH_LEFT, GRAPH_TOP );
  for (posLine = 0; posLine < 5; posLine++) {
    context.moveTo( GRAPH_LEFT, yaxList[posLine] );
    context.lineTo( GRAPH_RIGHT, yaxList[posLine] );
  }
  context.stroke();

  // create line indicating emissions
  context.beginPath();
  context.moveTo(xList[0], yList[0]);
  for (var posEm = 0; posEm < 15; posEm++) {
    context.lineTo(xList[posEm], yList[posEm]);
  }
  context.strokeStyle = "#4708ce";
  context.stroke();

  return xList, yList
}

function ticks(xList, yaxList){
  // create ticks for x-axis
  context.beginPath();
  context.moveTo( GRAPH_LEFT, GRAPH_BOTTOM );
  for (var posTickX = 0; posTickX < 15; posTickX++) {
    context.lineTo( xList[posTickX], GRAPH_BOTTOM + 5);
    context.moveTo( xList[posTickX + 1], GRAPH_BOTTOM);
  }
  context.stroke();

  // create ticks for y-axis
  context.beginPath();
  context.moveTo( GRAPH_RIGHT, GRAPH_BOTTOM );
  for (var posTickY = 0; posTickY < 5; posTickY++) {
    context.lineTo( GRAPH_RIGHT + 5, yaxList[posTickY]);
    context.moveTo( GRAPH_RIGHT,  yaxList[posTickY + 1]);
  }
  context.stroke();

  return xList, yaxList
}

function layout(coordinateList, lines, tick){
  // create titles
  context.fillText("Year", GRAPH_RIGHT / 2, GRAPH_BOTTOM + 50);
  context.save();
  context.rotate(-Math.PI / 2);
  context.fillText("GHG emissions (Mt)", GRAPH_RIGHT + 80, GRAPH_BOTTOM / 2);
  context.restore();
  context.save();
  context.font="bold 16px Arial";
  context.fillText("Estimated greenhouse gas emissions (Mt) in Montana (2006)", GRAPH_TOP - 15, GRAPH_LEFT + 10);
  context.restore();
  context.stroke();

  // draw reference value for x axis
  for (var refValX = 0; refValX < 15; refValX++) {
    context.fillText(years[refValX], xList[refValX] - 10, GRAPH_BOTTOM + 15);
    context.stroke();
  }

  // draw reference value for y axis
  for (var refValY = 0; refValY < 5; refValY++) {
    context.fillText(yAxisValues[refValY], GRAPH_RIGHT + 10, yaxList[refValY]);
    context.stroke();
  }
  return years, xList, yAxisValues, yaxList
}
