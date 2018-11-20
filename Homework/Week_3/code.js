// Harmke Vliek
// 10989137
// JavaScript code for linegraph.html

var fileName = "data.json";
var txtFile = new XMLHttpRequest();
txtFile.onreadystatechange = function() {
    if (txtFile.readyState === 4 && txtFile.status == 200) {
        var data = JSON.parse(txtFile.responseText);

        // create list to save the keys (years)
        years = Object.keys(data)
        // create list for values sorted based on years
        values = []

        // take years as index, add values of pebua to values
        years.forEach(function(element) {
          values.push(data[element]['Projected Emissions - Business As Usual'])
        })

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

      var canvas = document.getElementById( "canvas" );
      var context = canvas.getContext( "2d" );

      // declare graph start and end
      var GRAPH_TOP = 50;
      var GRAPH_BOTTOM = 250;
      var GRAPH_LEFT = 120;
      var GRAPH_RIGHT = 550;
      var GRAPH_LABEL = 1;

      var GRAPH_HEIGHT = 250;
      var GRAPH_WIDTH = 500;
      // clear canvas (if another graph was previously drawn)
      context.clearRect( 0, 0, 500, 400 );

      // draw X and Y axis
      context.beginPath();
      context.moveTo( GRAPH_LEFT, GRAPH_TOP );
      context.lineTo( GRAPH_LEFT, GRAPH_BOTTOM );
      context.lineTo( GRAPH_RIGHT, GRAPH_BOTTOM );
      context.stroke();

      // draw titles
      context.fillText("Year", GRAPH_RIGHT / 2, GRAPH_BOTTOM + 50);
      context.fillText("GHG emissions", GRAPH_LABEL + 30, GRAPH_HEIGHT / 2);
      context.stroke();
    }
}
txtFile.open("GET", fileName);
txtFile.send();
