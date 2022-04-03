// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// get the data
const graphGenPromise = d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv").then(function (data) {
    // X axis: scale and draw:
    const x = d3
        .scaleLinear()
        .domain([0, 1000]) // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, width]);
    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x));

    // set the parameters for the histogram
    const histogram = d3
        .histogram()
        .value(function (d) {
            return d.price;
        }) // I need to give the vector of value
        .domain(x.domain()) // then the domain of the graphic
        .thresholds(x.ticks(70)); // then the numbers of bins

    // And apply this function to data to get the bins
    const bins = histogram(data);

    // Y axis: scale and draw:
    const y = d3.scaleLinear().range([height, 0]);
    y.domain([
        0,
        d3.max(bins, function (d) {
            return d.length;
        }),
    ]); // d3.hist has to be called before the Y axis obviously
    svg.append("g").call(d3.axisLeft(y));

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", 1)
        .attr("transform", function (d) {
            return `translate(${x(d.x0)} , ${y(d.length)})`;
        })
        .attr("width", function (d) {
            return x(d.x1) - x(d.x0) - 1;
        })
        .attr("height", function (d) {
            return height - y(d.length);
        })
        .style("fill", "#69b3a2");
    //console.log("graph created");
});

function getTallestSvgElement(graph) {
    if (!graph) return; //end if no graph found

    const densities = graph.querySelectorAll("rect"); //find all rect svg elements
    if (!densities) return;

    /*
        gets the max height of svg element based on the density style
    */
    let nodeMaxHeight = densities[0];
    densities.forEach((node) => {
        maxHeight = parseFloat(nodeMaxHeight.getAttribute("height"));
        nodeHeight = parseFloat(node.getAttribute("height"));
        if (nodeHeight > maxHeight) {
            nodeMaxHeight = node;
        }
    });
    return nodeMaxHeight;
}

function addHintToElement(element, text, location) {
    /*
        adds the HTML hint options to be picked up by introJs
    */
    if (!element) return;
    element.setAttribute("data-hint", text);
    element.setAttribute("data-hint-position", location);
}

graphGenPromise.then(() => {
    const graph = document.querySelector("#my_dataviz");
    addHintToElement(graph, "This is a Density Graph", "middle-middle");

    const tallest = getTallestSvgElement(graph);
    addHintToElement(tallest, "This data point is the most likely to occur!", "top-middle");

    const axes = document.querySelectorAll(".domain");
    addHintToElement(axes[0], "This is the x-axis, it represents all the events that can occur in the experiment", "top-right");
    addHintToElement(
        axes[1],
        "The y-axis represents the chance it will occur or the number of occurrences, the taller the spike the more likely it is to occur!",
        "middle-middle"
    );

    introJs().start();
    introJs().addHints();
});
