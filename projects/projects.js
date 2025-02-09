import { fetchJSON } from '../global.js';

let query = '';  // ✅ Stores the search query

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

    // ✅ Store projects globally for filtering
    let allProjects = projects;

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

    // ✅ Render all projects initially
    renderProjects(allProjects);

    // ✅ Search Functionality
    let searchInput = document.querySelector('.searchBar');

    searchInput.addEventListener('input', (event) => {  // Live search
        query = event.target.value.toLowerCase();  // Convert query to lowercase for case-insensitive search

        let filteredProjects = allProjects.filter(project =>
            project.title.toLowerCase().includes(query) ||  // Search in titles
            project.year.toString().includes(query)         // Allow searching by year
        );

        renderProjects(filteredProjects);  // ✅ Re-render projects
    });
}

// ✅ Run function on page load
document.addEventListener("DOMContentLoaded", loadAllProjects);
