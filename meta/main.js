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
    const margin = { top: 20, right: 20, bottom: 50, left: 80 };

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([0, width - margin.left - margin.right])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([height - margin.top - margin.bottom, 0]);

    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(24).tickFormat(d => `${d}:00`);

    // Grid lines
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale).tickSize(-width + margin.left + margin.right).tickFormat(""));

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickSize(-height + margin.top + margin.bottom).tickFormat(""));

    // X Axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(xAxis)
        .append("text")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Date");

    // Y Axis
    svg.append("g")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -((height - margin.top - margin.bottom) / 2))
        .attr("y", -60)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Time of Day");

    const circles = svg.selectAll("circle")
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

    // Brush selection
    const brush = d3.brush()
        .extent([[0, 0], [width - margin.left - margin.right, height - margin.top - margin.bottom]])
        .on("brush", brushed);

    svg.append("g").call(brush);

    function brushed(event) {
        const selection = event.selection;
        if (!selection) return;

        const [[x0, y0], [x1, y1]] = selection;

        circles.attr("fill", d => {
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
