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
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let arc = arcGenerator({
    startAngle: 0,
    endAngle: 2 * Math.PI,
});
d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');
let data = [1, 2];
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

let arcs = arcData.map((d) => arcGenerator(d));
// Define an array of colors, or use D3's built-in color schemes
let colors = ['gold', 'purple'];

// Iterate over the arcs and append the paths to the SVG
arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)  // Set the 'd' attribute for the arc path
      .attr('fill', colors[idx])  // Set the fill color for each slice based on its index
      .attr('stroke', '#fff')  // Optional: add a white stroke around the slice
      .style('stroke-width', '2px');  // Optional: set stroke width
});


