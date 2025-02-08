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

// Ensure the DOM is fully loaded before running the D3 code
document.addEventListener("DOMContentLoaded", function () {
    // Pie chart data (two slices: 33% and 66%)
    let data = [1, 2]; // The numbers represent the slices

    let total = 0;
    // Calculate the total of the data
    for (let d of data) {
        total += d;
    }

    // Calculate start and end angles for each slice
    let angle = 0;
    let arcData = [];

    for (let d of data) {
        let endAngle = angle + (d / total) * 2 * Math.PI;
        arcData.push({ startAngle: angle, endAngle });
        angle = endAngle;
    }

    // Create an arc generator for D3
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50); // Full circle (no donut hole)
    let arcs = arcData.map((d) => arcGenerator(d)); // Generate paths for the pie slices

    // Select the SVG element and add the pie chart slices
    const svg = d3.select("#projects-pie-plot")
        .attr("width", 200)
        .attr("height", 200)
        .append("g")
        .attr("transform", "translate(100, 100)"); // Center the pie chart

    // Append the pie slices
    arcs.forEach((arc, index) => {
        svg.append('path')
            .attr('d', arc)  // Set the arc path
            .attr('fill', index === 0 ? 'red' : 'blue')  // Alternate colors for slices
            .attr('stroke', '#fff')  // White stroke for better separation
            .style('stroke-width', '2px'); // Stroke width
    });
});
