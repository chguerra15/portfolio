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
    d3.select("#projects-pie-plot")
      .append("path")
      .attr("d", arcGenerator(arc))
      .attr("fill", colors[idx])
      .attr("stroke", "#fff")
      .style("stroke-width", "2px");
});
