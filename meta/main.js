document.addEventListener("DOMContentLoaded", function() {
    d3.csv("loc.csv").then(function(data) {
        data.forEach(d => {
            d.datetime = new Date(d.time);
            d.hourFrac = d.datetime.getHours() + d.datetime.getMinutes() / 60;
            d.lines = +d.length;
        });

        createScatterplot(data);
        createSummary(data);
    }).catch(error => {
        console.error("Error loading data:", error);
        d3.select("#summary").append("p").text("Failed to load data.");
    });
});

function createScatterplot(commits) {
    const width = 1000;
    const height = 600;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "#f9f9f9")
        .style("overflow", "visible");

    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([80, width - 80])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([height - 80, 80]);

    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(24).tickFormat(d => `${d}:00`);

    svg.append("g")
        .attr("transform", `translate(0,${height - 80})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(80,0)")
        .call(yAxis);

    svg.append("g")
        .selectAll("circle")
        .data(commits)
        .join("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", d => Math.sqrt(d.lines) + 3) // Adjust radius based on commit size
        .attr("fill", "steelblue")
        .style("opacity", 0.7)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "orange");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", "steelblue");
        });
}
