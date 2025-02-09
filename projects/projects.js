import { fetchJSON } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";


let query = '';
let selectedYear = null; // ✅ Stores the selected pie chart filter

async function loadAllProjects() {
    const projectsContainer = document.querySelector('.projects');
    if (!projectsContainer) {
        console.error("Projects page container not found.");
        return;
    }

    // ✅ Fetch projects data
    const projects = await fetchJSON('../lib/projects.json');
    if (!projects || projects.length === 0) {
        projectsContainer.innerHTML = "<p>No projects available.</p>";
        return;
    }

    let allProjects = projects; // Store projects globally for filtering

    // ✅ Function to Render Projects
    function renderProjects(filteredProjects) {
        projectsContainer.innerHTML = "";  // Clear previous results

        filteredProjects.forEach(project => {
            const article = document.createElement('article');
            article.innerHTML = `
                <img src="${project.image}" alt="${project.title}">
                <h2>${project.title}</h2>
                <div class="project-info">
                    <p>${project.description}</p>
                    <p class="project-year">c. ${project.year}</p> 
                </div>
            `;
            projectsContainer.appendChild(article);
        });
    }

    // ✅ Function to Filter Projects
    function getFilteredProjects() {
        return allProjects.filter(project =>
            (!query || Object.values(project).join('\n').toLowerCase().includes(query.toLowerCase())) &&
            (!selectedYear || project.year === selectedYear)
        );
    }
    

    // ✅ Function to Render Pie Chart
    function renderPieChart(projectsGiven) {
        let rolledData = d3.rollups(
            projectsGiven,
            (v) => v.length,
            (d) => d.year,
        );

        let data = rolledData.map(([year, count]) => ({ value: count, label: year }));

        const colors = ["#D98CA6", "#6096C3", "#B6D7A8", "#6AA84F"];
        const width = 300, height = 300;
        const radius = Math.min(width, height) / 2;

        let svg = d3.select("#projects-pie-plot");
        svg.selectAll("*").remove(); // ✅ Clear previous chart

        let g = svg
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const pie = d3.pie().value(d => d.value);
        const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

        let arcs = pie(data);

        g.selectAll("path")
            .data(arcs)
            .enter()
            .append("path")
            .attr("d", arcGenerator)
            .attr("fill", (d, i) => colors[i])
            .attr("stroke", "#fff")
            .style("stroke-width", "2px")
            .style("cursor", "pointer") // ✅ Clickable slices
            .on("click", (event, d) => {
                selectedYear = selectedYear === d.data.label ? null : d.data.label;
                renderProjects(getFilteredProjects());
                renderPieChart(getFilteredProjects()); // ✅ Update pie
            });

        renderLegend(data, colors);
    }

    // ✅ Function to Render Legend
    function renderLegend(data, colors) {
        let legend = d3.select("#legend");
        legend.selectAll("*").remove(); // ✅ Clear previous legend

        let items = legend.selectAll(".legend-item")
            .data(data)
            .enter()
            .append("div")
            .attr("class", "legend-item")
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                selectedYear = selectedYear === d.label ? null : d.label;
                renderProjects(getFilteredProjects());
                renderPieChart(getFilteredProjects()); // ✅ Update pie
            });

        items.append("div")
            .attr("class", "legend-color")
            .style("background-color", (d, i) => colors[i]);

        items.append("span")
            .attr("class", "legend-text")
            .text(d => `${d.label} (${d.value})`);
    }

    // ✅ Render all projects initially
    renderProjects(allProjects);
    renderPieChart(allProjects);

    // ✅ Search Functionality
    let searchInput = document.querySelector('.searchBar');
    searchInput.addEventListener('input', (event) => {  // Live search
        query = event.target.value.toLowerCase();  

        renderProjects(getFilteredProjects());
        renderPieChart(getFilteredProjects()); // ✅ Update pie
    });
}

// ✅ Run function on page load
document.addEventListener("DOMContentLoaded", loadAllProjects);
