import { fetchJSON, renderProjects } from '../global.js';

async function loadAllProjects() {
    const projectsContainer = document.querySelector('.projects');

    if (!projectsContainer) {
        console.error("Projects page container not found.");
        return;
    }

    const projects = await fetchJSON('../lib/projects.json');
    if (!projects || projects.length === 0) {
        projectsContainer.innerHTML = "<p>No projects available.</p>";
        return;
    }

    renderProjects(projects, projectsContainer, 'h2');
}

if (!document.documentElement.classList.contains('home')) {
    loadAllProjects();
}

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

document.addEventListener("DOMContentLoaded", () => {
    const data = [1, 2, 3, 4, 5, 5]; // Example project data
    const colors = d3.schemeCategory10; // Built-in color scheme

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    // Select the SVG, clear old content, and set up the canvas
    const svg = d3.select("#projects-pie-plot")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .html("") // Clears previous SVG content
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Generate pie slices
    const pie = d3.pie().value(d => d);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = pie(data);

    svg.selectAll("path")
        .data(arcs)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (d, i) => colors[i % colors.length])
        .attr("stroke", "#fff")
        .style("stroke-width", "2px");

    // Generate legend
    const legend = d3.select("#legend");
    data.forEach((d, i) => {
        const item = legend.append("div").attr("class", "legend-item");
        item.append("div").attr("class", "legend-color").style("background", colors[i % colors.length]);
        item.append("div").attr("class", "legend-text").text(`Value: ${d}`);
    });
});