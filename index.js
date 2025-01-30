import { fetchJSON, renderProjects } from '../global.js';
import { fetchGitHubData } from '../global.js';

async function loadProjects() {
    const projects = await fetchJSON('./lib/projects.json');

    if (!projects || projects.length === 0) {
        document.querySelector('.projects').innerHTML = "<p>No projects available.</p>";
        return;
    }

    const latestProjects = projects.slice(0, 3);
    const projectsContainer = document.querySelector('.projects');

    if (!projectsContainer) return;

    projectsContainer.innerHTML = '';

    latestProjects.forEach(project => renderProjects(project, projectsContainer));
}

async function loadGitHubProfile() {
    const profileStats = document.querySelector('#profile-stats');

    if (!profileStats) return;

    profileStats.innerHTML = "<p>Loading GitHub data...</p>";

    const githubData = await fetchGitHubData('chguerra15');

    if (!githubData || Object.keys(githubData).length === 0) {
        profileStats.innerHTML = "<p>GitHub data unavailable.</p>";
        return;
    }

    profileStats.innerHTML = `
        <h2>GitHub Profile Stats</h2>
        <div class="github-stats-container">
            <div class="github-stat"><dt>Followers</dt><dd>${githubData.followers ?? 'N/A'}</dd></div>
            <div class="github-stat"><dt>Following</dt><dd>${githubData.following ?? 'N/A'}</dd></div>
            <div class="github-stat"><dt>Public Repos</dt><dd>${githubData.public_repos ?? 'N/A'}</dd></div>
            <div class="github-stat"><dt>Public Gists</dt><dd>${githubData.public_gists ?? 'N/A'}</dd></div>
        </div>
    `;
}

(async function initialize() {
    await loadProjects();
    await loadGitHubProfile();
})();
