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
    // Example data for pie chart slices (each represents a year with project counts)
    let data = [
        { year: 2024, count: 3 },
        { year: 2023, count: 4 },
        { year: 2022, count: 3 },
        { year: 2021, count: 2 }
    ]; 

    let total = data.reduce((acc, val) => acc + val.count, 0);  // Sum of all counts

    let angle = 0;
    let arcData = [];
    data.forEach(d => {
        let endAngle = angle + (d.count / total) * 2 * Math.PI;
        arcData.push({ startAngle: angle, endAngle, year: d.year });
        angle = endAngle;
    });

    // Arc generator for pie chart slices
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let arcs = arcData.map(d => arcGenerator(d));

    const svg = d3.select("#projects-pie-plot")
        .attr("width", 200)
        .attr("height", 200)
        .append("g")
        .attr("transform", "translate(100, 100)"); // Center the pie chart within the SVG

    // Define colors for each slice
    const colors = ['#32CD32', '#4682B4', '#FF69B4', '#8A2BE2']; // Green, Blue, Pink, Purple

    // Append pie slices
    arcs.forEach((arc, idx) => {
        svg.append('path')
            .attr('d', arc)  // Set the "d" attribute to the arc's path data
            .attr('fill', colors[idx])  // Assign color based on the index
            .attr('stroke', '#fff')  // Add a white stroke for separation
            .style('stroke-width', '2px');  // Set stroke width for visibility
    });

    // Create the legend for the pie chart
    const legendContainer = d3.select('#legend');
    data.forEach((d, idx) => {
        legendContainer.append('div')
            .attr('class', 'legend-item')
            .html(`
                <span class="legend-color" style="background-color: ${colors[idx]};"></span>
                <span class="legend-text">${d.year} (${d.count})</span>
            `);
    });
});
