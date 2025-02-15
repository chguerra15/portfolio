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
        console.error("Error loading data:", error);
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

    const dots = svg.append("g")
        .selectAll("circle")
        .data(commits)
        .join("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", d => Math.sqrt(d.lines) * 2 + 3) // Adjust radius for better visibility
        .attr("fill", "steelblue")
        .style("opacity", 0.7)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "orange");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", "steelblue");
        });
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
        { label: "Most Active Time", value: "Unknown" }
    ];

    const summaryDiv = d3.select("#summary");
    summaryDiv.selectAll(".summary-item")
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