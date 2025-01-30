import { fetchJSON, renderProjects, fetchGitHubData, renderGitHubStats } from './global.js';

async function loadProjects() {
    const projectsContainer = document.querySelector('.projects');
    if (!projectsContainer) return;
    
    const projects = await fetchJSON('./lib/projects.json');
    renderProjects(projects.slice(0, 3), projectsContainer, 'h2');
}

async function loadGitHubProfile() {
    const profileStats = document.querySelector('#profile-stats');
    if (!profileStats) return;
    
    const githubData = await fetchGitHubData('chguerra15');
    renderGitHubStats(githubData, profileStats);
}

(async function initialize() {
    await loadProjects();
    await loadGitHubProfile();
})();

// projects.js
import { fetchJSON, renderProjects } from '../global.js';

async function loadAllProjects() {
    const projectsContainer = document.querySelector('.projects');
    if (!projectsContainer) return;
    
    const projects = await fetchJSON('../lib/projects.json');
    renderProjects(projects, projectsContainer, 'h2');
}

loadAllProjects();
