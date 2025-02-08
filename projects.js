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
    const data = [3, 7]; // Example project data (adjust as needed)
    const colors = ['gold', 'purple'];

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    // Select the SVG and remove any existing content (prevents duplication)
    const svg = d3.select("#projects-pie-plot")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `${-radius} ${-radius} ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .html("") // Ensure the SVG is cleared before adding new elements
        .append("g")
        .attr("transform", `translate(0, 0)`);

    const pie = d3.pie().sort(null).value(d => d); // Ensures slices are correctly sized
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = pie(data);

    // Append pie chart slices
    svg.selectAll("path")
        .data(arcs)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (d, i) => colors[i])
        .attr("stroke", "#fff")
        .style("stroke-width", "2px");
});
