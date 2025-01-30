import { fetchJSON, renderProjects, fetchGitHubData, renderGitHubStats } from './global.js';

async function loadHomepageProjects() {
    const projectsContainer = document.querySelector('.projects');

    if (!projectsContainer) {
        console.error("Homepage projects container not found.");
        return;
    }

    const projects = await fetchJSON('./lib/projects.json');
    if (!projects || projects.length === 0) {
        projectsContainer.innerHTML = "<p>No recent projects available.</p>";
        return;
    }

    renderProjects(projects.slice(0, 3), projectsContainer, 'h2');
}

async function loadGitHubProfile() {
    const profileStats = document.querySelector('#profile-stats');
    if (!profileStats) return;
    
    const githubData = await fetchGitHubData('chguerra15');
    renderGitHubStats(githubData, profileStats);
}

// ✅ Ensure scripts only run on the correct pages
if (document.documentElement.classList.contains('home')) {
    (async function initializeHomepage() {
        await loadHomepageProjects();
        await loadGitHubProfile();
    })();
}
