import { fetchJSON, renderProjects } from '../global.js';

async function loadAllProjects() {
    const projectsContainer = document.querySelector('.projects');
    if (!projectsContainer) return;
    
    const projects = await fetchJSON('../lib/projects.json');
    renderProjects(projects, projectsContainer, 'h2');
}

loadAllProjects();
