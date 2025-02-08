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

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Define the pie chart data
let data = [1, 2]; // Two slices: 33% and 66%

let total = 0;
for (let d of data) {
    total += d;
}

let angle = 0;
let arcData = [];

for (let d of data) {
    let startAngle = angle;
    let endAngle = angle + (d / total) * 2 * Math.PI;
    arcData.push({ startAngle, endAngle });
    angle = endAngle;
}

// Define SVG
const width = 200;
const height = 200;
const radius = Math.min(width, height) / 2;

const svg = d3.select("#projects-pie-plot")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

// Define arc generator
const arc = d3.arc()
    .innerRadius(0)  // Full pie (no donut hole)
    .outerRadius(radius);

// Append slices
svg.selectAll("path")
    .data(arcData)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => i === 0 ? "red" : "blue")  // Assign colors
    .attr("stroke", "#fff")
    .style("stroke-width", "2px");


