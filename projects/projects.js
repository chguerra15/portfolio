import { fetchJSON } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function loadProjectPieChart() {
    const svg = d3.select("#projects-pie-plot");
    if (svg.empty()) {
        console.error("SVG element not found!");
        return;
    }

    // ✅ Fetch project data
    const projects = await fetchJSON('../lib/projects.json');
    if (!projects || projects.length === 0) {
        console.error("No projects found.");
        return;
    }

    // ✅ Group projects by year using `d3.rollups()`
    let rolledData = d3.rollups(
        projects,
        (v) => v.length,  // Count occurrences
        (d) => d.year      // Group by year
    );

    // ✅ Convert rolled data into an array suitable for the pie chart
    let data = rolledData.map(([year, count]) => ({ value: count, label: year }));

    // ✅ Sort years in descending order (optional)
    data.sort((a, b) => b.label - a.label);

    // ✅ Define colors dynamically based on the number of years
    const colors = d3.scaleOrdinal()
        .domain(data.map(d => d.label))
        .range(["#D98CA6", "#6096C3", "#B6D7A8", "#6AA84F"]); // Add more colors if needed

    // ✅ Pie chart dimensions
    const width = 300, height = 300, radius = Math.min(width, height) / 2;

    svg.attr("width", width)
       .attr("height", height)
       .attr("viewBox", `0 0 ${width} ${height}`)
       .attr("preserveAspectRatio", "xMidYMid meet")
       .html("")  // Clear previous chart
       .append("g")
       .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const g = svg.select("g");
    const pie = d3.pie().value(d => d.value);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    // ✅ Draw Pie Chart
    const arcs = pie(data);
    g.selectAll("path")
        .data(arcs)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", d => colors(d.data.label))
        .attr("stroke", "#fff")
        .style("stroke-width", "2px");

    // ✅ Update Legend
    const legend = d3.select("#legend").html(""); // Clear old legend
    data.forEach((d, i) => {
        const item = legend.append("div").attr("class", "legend-item");
        item.append("div").attr("class", "legend-color").style("background-color", colors(d.label));
        item.append("div").attr("class", "legend-text").text(`${d.label} (${d.value})`);
    });

    console.log("Pie chart successfully rendered with project data!");
}

// ✅ Run function on page load
document.addEventListener("DOMContentLoaded", loadProjectPieChart);
