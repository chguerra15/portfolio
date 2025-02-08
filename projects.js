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

// Mock data for projects (replace with actual data)
const projects = [
    { title: "Project 1", description: "Description of project 1", year: 2021 },
    { title: "Project 2", description: "Description of project 2", year: 2022 },
    { title: "Project 3", description: "Description of project 3", year: 2021 },
    { title: "Project 4", description: "Description of project 4", year: 2023 },
    { title: "Project 5", description: "Description of project 5", year: 2022 },
];

// Function to render the pie chart
function renderPieChart(projects) {
    // Count projects per year
    const yearCounts = projects.reduce((acc, project) => {
        acc[project.year] = (acc[project.year] || 0) + 1;
        return acc;
    }, {});

    const data = Object.entries(yearCounts).map(([year, count]) => ({
        year: year,
        count: count,
    }));

    // Pie chart dimensions
    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;

    // Create the SVG container
    const svg = d3.select("#projects-pie-plot")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Arc generator for pie slices
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Pie layout to calculate angles based on data
    const pie = d3.pie().value(d => d.count);

    // Colors for slices
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw the pie slices
    svg.selectAll("path")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(i))
        .attr("stroke", "#fff")
        .style("stroke-width", "2px")
        .on("click", function(event, d) {
            // Filter projects based on the selected year
            filterProjects(d.data.year);
        });

    // Labels for each slice
    svg.selectAll("text")
        .data(pie(data))
        .enter()
        .append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#fff")
        .text(d => d.data.year);
}

// Function to filter projects by year
function filterProjects(year) {
    const filteredProjects = projects.filter(project => project.year === year);
    renderProjects(filteredProjects);
}

// Function to render the filtered projects
function renderProjects(filteredProjects) {
    const projectsContainer = document.querySelector('.projects');
    projectsContainer.innerHTML = ""; // Clear existing projects

    filteredProjects.forEach(project => {
        const article = document.createElement('article');
        article.innerHTML = `
            <h2>${project.title}</h2>
            <p>${project.description}</p>
            <p class="project-year">c. ${project.year}</p>
        `;
        projectsContainer.appendChild(article);
    });
}

// Initialize the pie chart
renderPieChart(projects);
