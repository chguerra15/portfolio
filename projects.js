console.log("Checking if projects.js is loaded!");


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
    const data = [3, 4, 3, 2]; 
    const labels = ["2024", "2023", "2022", "2021"];
    const colors = ["#D98CA6", "#6096C3", "#B6D7A8", "#6AA84F"];

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    const svg = d3.select("#projects-pie-plot");

    if (svg.empty()) {
        console.error("SVG element not found!");
        return;
    }

    svg.attr("width", width)
       .attr("height", height)
       .attr("viewBox", `0 0 ${width} ${height}`)
       .attr("preserveAspectRatio", "xMidYMid meet")
       .html("") 
       .append("g")
       .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const g = svg.select("g"); 

    const pie = d3.pie().value(d => d);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = pie(data);

    g.selectAll("path")
        .data(arcs)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (d, i) => colors[i])
        .attr("stroke", "#fff")
        .style("stroke-width", "2px");

    console.log("Pie chart successfully rendered!");
});
