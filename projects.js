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

document.addEventListener("DOMContentLoaded", function () {
    // Sample data for the pie chart (Replace with actual data)
    let data = [1, 2]; // Each number represents a slice of the pie

    let total = 0;
    // Calculate the total of the data
    for (let d of data) {
        total += d;
    }

    let angle = 0;
    let arcData = [];

    // Calculate start and end angles for each slice
    for (let d of data) {
        let endAngle = angle + (d / total) * 2 * Math.PI;
        arcData.push({ startAngle: angle, endAngle });
        angle = endAngle;
    }

    // Create an arc generator for D3
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50); // Full circle (no donut hole)
    let arcs = arcData.map((d) => arcGenerator(d)); // Generate paths for the pie slices

    // Select the existing SVG element with id "projects-pie-plot"
    const svg = d3.select("#projects-pie-plot")
        .attr("width", 200)
        .attr("height", 200)
        .append("g")
        .attr("transform", "translate(100, 100)"); // Center the pie chart

    // Array of colors for each slice
    const colors = ['red', 'blue'];

    // Append the pie slices (paths)
    arcs.forEach((arc, idx) => {
        svg.append('path')
            .attr('d', arc)  // Set the "d" attribute to the arc's path data
            .attr('fill', colors[idx])  // Use the color from the array based on the index
            .attr('stroke', '#fff')  // Add a white stroke for separation
            .style('stroke-width', '2px');  // Set stroke width for better visibility
    });
});
