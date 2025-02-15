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
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("overflow", "visible");

    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([80, width - 80])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([height - 80, 80]);

    svg.append("g")
        .attr("transform", `translate(0,${height - 50})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", "translate(80,0)")
        .call(d3.axisLeft(yScale).ticks(24).tickFormat(d => `${d}:00`));

    svg.append("g")
        .selectAll("circle")
        .data(commits)
        .join("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", 8)
        .attr("fill", "steelblue")
        .style("opacity", 0.7);
}

function createSummary(data) {
    const summaryData = [
        { label: "Commits", value: data.length },
        { label: "Files", value: new Set(data.map(d => d.file)).size },
        { label: "Total LOC", value: d3.sum(data, d => d.lines).toLocaleString() },
        { label: "Max Depth", value: d3.max(data, d => +d.depth) || 0 },
        { label: "Avg Depth", value: (d3.mean(data, d => +d.depth) || 0).toFixed(2) },
        { label: "Longest Line", value: d3.max(data, d => d.lines) || 0 },
        { label: "Authors", value: new Set(data.map(d => d.author)).size },
        { label: "Days Worked", value: new Set(data.map(d => d.date)).size },
        { label: "Most Active Time", value: "Unknown" }
    ];

    d3.select("#summary").selectAll(".summary-item")
        .data(summaryData)
        .enter()
        .append("div")
        .attr("class", "summary-item")
        .html(d => `
            <div class="summary-label">${d.label}</div>
            <div class="summary-value">${d.value}</div>
        `);
}
