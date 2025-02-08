console.log("🚀 projects.js is starting...");

import { fetchJSON, renderProjects } from '../global.js';

console.log("✅ Successfully imported fetchJSON and renderProjects.");

async function loadAllProjects() {
    console.log("📂 Loading projects...");
    const projectsContainer = document.querySelector('.projects');

    if (!projectsContainer) {
        console.error("❌ Projects page container not found.");
        return;
    }

    try {
        const projects = await fetchJSON('../lib/projects.json');
        console.log("✅ Projects fetched:", projects);

        if (!projects || projects.length === 0) {
            projectsContainer.innerHTML = "<p>No projects available.</p>";
            return;
        }

        renderProjects(projects, projectsContainer, 'h2');
    } catch (error) {
        console.error("❌ Error fetching projects:", error);
    }
}

if (!document.documentElement.classList.contains('home')) {
    loadAllProjects();
}

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

console.log("✅ D3.js imported successfully.");

document.addEventListener("DOMContentLoaded", () => {
    console.log("📊 Starting pie chart rendering...");

    const data = [3, 4, 3, 2]; 
    const labels = ["2024", "2023", "2022", "2021"];
    const colors = ["#D98CA6", "#6096C3", "#B6D7A8", "#6AA84F"];

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    const svg = d3.select("#projects-pie-plot");

    if (svg.empty()) {
        console.error("❌ SVG element not found!");
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

    console.log("✅ Pie chart successfully rendered!");
});

console.log("🚀 projects.js finished execution.");
