import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

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
    profileStats.innerHTML = `
        <dl>
          <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
          <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
          <dt>Followers:</dt><dd>${githubData.followers}</dd>
          <dt>Following:</dt><dd>${githubData.following}</dd>
        </dl>
    `;
}

(async function initialize() {
    await loadProjects();
    await loadGitHubProfile();
})();