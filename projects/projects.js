import { fetchJSON } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function loadProjectPieChart() {
    const svg = d3.select("#projects-pie-plot");
    if (svg.empty()) {
        console.error("SVG element not found!");
        return;
    }

    // ✅ Fetch projects data
    const projects = await fetchJSON('../lib/projects.json');
    if (!projects || projects.length === 0) {
        console.error("No projects found.");
        return;
    }

    // ✅ Count projects per year
    const yearCounts = {};
    projects.forEach(project => {
        const year = project.year;
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    // ✅ Convert yearCounts to an array
    const data = Object.entries(yearCounts).map(([year, count]) => ({ year, count }));
    const years = data.map(d => d.year);
    const values = data.map(d => d.count);

    // ✅ Colors for each year
    const colors = d3.scaleOrdinal()
        .domain(years)
        .range(["#D98CA6", "#6096C3", "#B6D7A8", "#6AA84F"]);

    // ✅ Pie Chart Config
    const width = 300, height = 300, radius = Math.min(width, height) / 2;

    svg.attr("width", width)
       .attr("height", height)
       .attr("viewBox", `0 0 ${width} ${height}`)
       .attr("preserveAspectRatio", "xMidYMid meet")
       .html("")  // Clear previous chart
       .append("g")
       .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const g = svg.select("g");
    const pie = d3.pie().value(d => d.count);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    // ✅ Draw Pie Chart
    const arcs = pie(data);
    g.selectAll("path")
        .data(arcs)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", d => colors(d.data.year))
        .attr("stroke", "#fff")
        .style("stroke-width", "2px");

    // ✅ Add Legend
    const legend = d3.select("#legend").html(""); // Clear old legend
    data.forEach((d, i) => {
        const item = legend.append("div").attr("class", "legend-item");
        item.append("div").attr("class", "legend-color").style("background-color", colors(d.year));
        item.append("div").attr("class", "legend-text").text(`${d.year} (${d.count})`);
    });

    console.log("Pie chart successfully rendered!");
}

// ✅ Run function on page load
document.addEventListener("DOMContentLoaded", loadProjectPieChart);
