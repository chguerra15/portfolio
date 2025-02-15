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
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "#fff");

    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([margin.left, width - margin.right])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(24).tickFormat(d => `${d}:00`);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis);

    // Circles for commits
    const dots = svg.append("g")
        .selectAll("circle")
        .data(commits)
        .join("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", d => Math.sqrt(d.lines) * 2) // Scales bubble size for visibility
        .attr("fill", "steelblue")
        .style("opacity", 0.7)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "orange");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", "steelblue");
        });

    // Selection box for multiple commits
    const brush = d3.brush()
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on("start brush", brushed);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushed(event) {
        const selection = event.selection;
        if (!selection) return;

        const [[x0, y0], [x1, y1]] = selection;

        dots.attr("fill", d => {
            const isSelected =
                xScale(d.datetime) >= x0 && xScale(d.datetime) <= x1 &&
                yScale(d.hourFrac) >= y0 && yScale(d.hourFrac) <= y1;
            return isSelected ? "red" : "steelblue";
        });
    }
}
