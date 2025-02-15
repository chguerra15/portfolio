async function loadData() {
    try {
        let data = await d3.csv("loc.csv");
        data.forEach(d => {
            d.datetime = new Date(d.time);
            d.hourFrac = d.datetime.getHours() + d.datetime.getMinutes() / 60;
            d.lines = +d.length;
        });
        return data;
    } catch (error) {
        console.error("Error loading CSV:", error);
        d3.select("#summary").append("p").text("Failed to load data.");
        return [];
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const data = await loadData();
    createScatterplot(data);
    createSummary(data);
});

function createScatterplot(commits) {
    if (!commits.length) return;

    const width = 1000;
    const height = 600;
    const margin = { top: 50, right: 50, bottom: 70, left: 80 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom
    };

    d3.select("#chart").selectAll("*").remove(); // Clear previous render

    const svg = d3.select("#chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("overflow", "visible")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([0, usableArea.width])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.height, 0]);

    const xAxis = d3.axisBottom(xScale)
        .tickSize(-usableArea.height)
        .tickFormat(d3.timeFormat("%a %d")); // Formats as 'Tue 13'

    const yAxis = d3.axisLeft(yScale)
        .tickSize(-usableArea.width)
        .tickFormat(d => `${d}:00`); // Formats as '10:00', '15:00', etc.

    // White background for better visibility
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", usableArea.width)
        .attr("height", usableArea.height)
        .attr("fill", "white")
        .attr("stroke", "#ddd");

    // Grid lines
    svg.append("g")
        .attr("class", "grid")
        .call(yAxis)
        .selectAll("line")
        .attr("stroke", "#ddd");

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${usableArea.height})`)
        .call(xAxis)
        .selectAll("line")
        .attr("stroke", "#ddd");

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0, ${usableArea.height})`)
        .call(xAxis)
        .selectAll("text")  // Rotate text for better readability
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    // Add Y axis
    svg.append("g")
        .call(yAxis);

    // Add axes labels
    svg.append("text")
        .attr("x", usableArea.width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -usableArea.height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Time of Day");

    const dots = svg.append("g").attr("class", "dots");

    dots.selectAll("circle")
        .data(commits)
        .join("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", d => Math.sqrt(d.lines) * 2 + 3)
        .attr("fill", "steelblue")
        .style("opacity", 0.7)
        .on("mouseover", function () {
            d3.select(this).attr("fill", "orange");
        })
        .on("mouseout", function () {
            d3.select(this).attr("fill", "steelblue");
        });

    // Selection box for commits
    const brush = d3.brush()
        .extent([[0, 0], [usableArea.width, usableArea.height]])
        .on("start brush", brushed);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushed(event) {
        const selection = event.selection;
        if (!selection) return;

        const [[x0, y0], [x1, y1]] = selection;

        dots.selectAll("circle").attr("fill", d => {
            const isSelected =
                xScale(d.datetime) >= x0 && xScale(d.datetime) <= x1 &&
                yScale(d.hourFrac) >= y0 && yScale(d.hourFrac) <= y1;
            return isSelected ? "red" : "steelblue";
        });
    }
}




function createSummary(data) {
    if (!data.length) return;

    const stats = [
        { label: "Commits", value: data.length },
        { label: "Files", value: new Set(data.map(d => d.file)).size },
        { label: "Total LOC", value: d3.sum(data, d => +d.length).toLocaleString() },
        { label: "Max Depth", value: d3.max(data, d => +d.depth) || 0 },
        { label: "Avg Depth", value: (d3.mean(data, d => +d.depth) || 0).toFixed(2) },
        { label: "Longest Line", value: d3.max(data, d => +d.length) || 0 },
        { label: "Authors", value: new Set(data.map(d => d.author)).size },
        { label: "Days Worked", value: new Set(data.map(d => d.date)).size },
    ];

    d3.select("#summary")
        .selectAll(".summary-item")
        .data(stats)
        .enter()
        .append("div")
        .attr("class", "summary-item")
        .html(d => `
            <div>
                <div class="summary-label">${d.label}</div>
                <div class="summary-value">${d.value}</div>
            </div>
        `);
}
