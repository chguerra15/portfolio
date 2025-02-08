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

document.addEventListener("DOMContentLoaded", function() {
    // Define the pie chart data
    let data = [1, 2]; // Two slices: 33% and 66%

    let total = 0;
    for (let d of data) {
        total += d;
    }

    let angle = 0;
    let arcData = [];

    for (let d of data) {
        let endAngle = angle + (d / total) * 2 * Math.PI;
        arcData.push({ startAngle: angle, endAngle });
        angle = endAngle;
    }

    // Define the arc generator
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let arcs = arcData.map((d) => arcGenerator(d));

    // Select the SVG and add paths
    const svg = d3.select("#projects-pie-plot")
        .attr("width", 200)
        .attr("height", 200)
        .append("g")
        .attr("transform", "translate(100, 100)");

    arcs.forEach(arc => {
        svg.append('path')
            .attr('d', arc)
            .attr('fill', (d, i) => i === 0 ? 'red' : 'blue')  // Alternate color for slices
            .attr('stroke', '#fff')
            .style('stroke-width', '2px');
    });
});
