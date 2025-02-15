document.addEventListener("DOMContentLoaded", function() {
    d3.csv("loc.csv").then(function(data) {
        data.forEach(d => {
            d.datetime = new Date(d.time);
            d.hourFrac = d.datetime.getHours() + d.datetime.getMinutes() / 60;
            d.lines = +d.length;
        });

        createScatterplot(data);
        updateSummary(data);
    }).catch(error => {
        console.error("Error loading data:", error);
        d3.select("#summary").append("p").text("Failed to load data.");
    });
});

function createScatterplot(commits) {
    const width = 1000;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };

    const svg = d3.select("#chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("background", "#fff");

    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([margin.left, width - margin.right])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.timeFormat("%b %d"));
    const yAxis = d3.axisLeft(yScale).ticks(24).tickFormat(d => `${d}:00`);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "middle");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .text("Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 15)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Time of Day");

    svg.append("g")
        .selectAll("circle")
        .data(commits)
        .join("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", d => Math.sqrt(d.lines) * 2)
        .attr("fill", "steelblue")
        .style("opacity", 0.7);
}

function updateSummary(data) {
    d3.select("#total-commits").text(data.length);
    d3.select("#total-files").text(new Set(data.map(d => d.file)).size);
    d3.select("#total-loc").text(d3.sum(data, d => +d.length).toLocaleString());
    d3.select("#max-depth").text(d3.max(data, d => +d.depth) || 0);
    d3.select("#longest-line").text(d3.max(data, d => +d.length) || 0);
    d3.select("#max-lines").text(d3.max(data, d => +d.line) || 0);
}
