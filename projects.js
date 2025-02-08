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

// Wait until the DOM is fully loaded before running the D3 code
document.addEventListener("DOMContentLoaded", function () {
    // Example data (each number is a percentage of the pie)
    let data = [1, 2]; // Each number represents a slice (you can replace this with real data)

    // Calculate the total of the data
    let total = data.reduce((acc, val) => acc + val, 0);

    // Define the start and end angles for each slice
    let angle = 0;
    let arcData = [];
    data.forEach(d => {
        let endAngle = angle + (d / total) * 2 * Math.PI;
        arcData.push({ startAngle: angle, endAngle });
        angle = endAngle;
    });

    // Define the arc generator
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50); // Full pie (no donut hole)
    let arcs = arcData.map(d => arcGenerator(d)); // Generate the paths for each slice

    // Select the existing SVG element (with id "projects-pie-plot")
    const svg = d3.select("#projects-pie-plot")
        .attr("width", 200) // Set width of the SVG
        .attr("height", 200) // Set height of the SVG
        .append("g")
        .attr("transform", "translate(100, 100)"); // Center the pie chart within the SVG

    // Define the colors for each slice
    const colors = ['red', 'blue']; // Add more colors if you have more slices

    // Append the pie slices (paths)
    arcs.forEach((arc, idx) => {
        svg.append('path')
            .attr('d', arc)  // Set the "d" attribute to the arc's path data
            .attr('fill', colors[idx])  // Assign color based on the index
            .attr('stroke', '#fff')  // Add a white stroke for separation
            .style('stroke-width', '2px');  // Set stroke width for visibility
    });
});
