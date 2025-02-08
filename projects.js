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
arcs.forEach((arc, idx) => {
    const colors = ['red', 'blue'];  // Array of colors (one for each slice)

    // Append each arc (pie slice) to the SVG
    d3.select('svg')
      .append('path')
      .attr('d', arc)  // Set the "d" attribute to the arc's path data
      .attr('fill', colors[idx])  // Use the color from the array based on the index
      .attr('stroke', '#fff')  // Add a white stroke for separation
      .style('stroke-width', '2px');  // Set the stroke width for better visibility
});


let colors = ['gold', 'purple'];

  



