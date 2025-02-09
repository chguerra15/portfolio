console.log("Checking if projects.js is loaded!");

import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function loadAllProjects() {
    const projectsContainer = document.querySelector(".projects");

    if (!projectsContainer) {
        console.error("Projects page container not found.");
        return;
    }

    const projects = await fetchJSON("../lib/projects.json");
    if (!projects || projects.length === 0) {
        projectsContainer.innerHTML = "<p>No projects available.</p>";
        return;
    }

    renderProjects(projects, projectsContainer, "h2");
    renderPieChart(projects); // Render pie chart after loading projects
}

if (!document.documentElement.classList.contains("home")) {
    loadAllProjects();
}

function renderPieChart(projectsGiven) {
    const colors = ["#D98CA6", "#6096C3", "#B6D7A8", "#6AA84F"];
    let selectedIndex = -1; // No slice is selected initially

    // Group projects by year and count occurrences
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    let data = rolledData.map(([year, count]) => ({ year, count }));

    // Set up SVG dimensions
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    // Select and clear existing SVG
    let svg = d3.select("#projects-pie-plot");
    svg.html(""); // Clear previous elements

    let g = svg
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.count);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = pie(data);

    // Append slices
    g.selectAll("path")
        .data(arcs)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (d, i) => colors[i])
        .attr("stroke", "#fff")
        .style("stroke-width", "2px")
        .style("cursor", "pointer") // Make it clear it's clickable
        .on("click", function (event, d) {
            selectedIndex = selectedIndex === d.index ? -1 : d.index;

            // Keep colors the same when selected
            g.selectAll("path")
                .attr("fill", (d, i) => selectedIndex === i ? colors[i] : colors[i]);

            // Update legend opacity
            d3.selectAll("#legend li")
                .style("opacity", (d, i) => selectedIndex === i || selectedIndex === -1 ? 1 : 0.5);
        });

    // Update legend
    let legend = d3.select("#legend");
    legend.html(""); // Clear previous legend

    legend
        .selectAll("li")
        .data(data)
        .enter()
        .append("li")
        .text((d) => `${d.year} (${d.count})`)
        .style("color", (d, i) => colors[i])
        .on("click", function (event, d) {
            selectedIndex = selectedIndex === d.index ? -1 : d.index;

            g.selectAll("path")
                .attr("fill", (d, i) => selectedIndex === i ? colors[i] : colors[i]);

            d3.selectAll("#legend li")
                .style("opacity", (d, i) => selectedIndex === i || selectedIndex === -1 ? 1 : 0.5);
        });

    console.log("Pie chart successfully rendered!");
}

// SEARCH FUNCTIONALITY
let query = "";
const searchInput = document.createElement("input");
searchInput.className = "searchBar";
searchInput.type = "search";
searchInput.placeholder = "🔍 Search projects...";
searchInput.setAttribute("aria-label", "Search projects");

// Insert search bar into DOM
document.querySelector(".projects").before(searchInput);

searchInput.addEventListener("input", (event) => {
    query = event.target.value.toLowerCase();

    fetchJSON("../lib/projects.json").then((projects) => {
        let filteredProjects = projects.filter((project) => {
            let values = Object.values(project).join("\n").toLowerCase();
            return values.includes(query);
        });

        renderProjects(filteredProjects, document.querySelector(".projects"), "h2");
        renderPieChart(filteredProjects);
    });
});
