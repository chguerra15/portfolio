import { fetchJSON, renderProjects } from '../global.js';
import { fetchGitHubData } from './global.js';

async function loadProjects() {
    console.log('Fetching projects...');
    
    const projects = await fetchJSON('../lib/projects.json');

    if (!projects || projects.length === 0) {
        console.warn('No projects found.');
        document.querySelector('.projects').innerHTML = "<p>No projects available.</p>";
        return;
    }

    console.log('Rendering latest projects...');
    const latestProjects = projects.slice(0, 3);
    const projectsContainer = document.querySelector('.projects');

    if (!projectsContainer) {
        console.error('Projects container not found.');
        return;
    }

    latestProjects.forEach(project => renderProjects(project, projectsContainer));
    console.log('Latest projects rendered successfully.');
}

async function loadGitHubProfile() {
    console.log('Fetching GitHub profile...');
    
    const profileStats = document.querySelector('#profile-stats');

    if (!profileStats) {
        console.error('GitHub profile container not found.');
        return;
    }

    profileStats.innerHTML = "<p>Loading GitHub data...</p>";

    const githubData = await fetchGitHubData('chguerra15'); // Your GitHub username

    if (!githubData) {
        console.error('Failed to fetch GitHub data.');
        profileStats.innerHTML = "<p>GitHub data unavailable.</p>";
        return;
    }

    console.log('GitHub data loaded successfully:', githubData);

    profileStats.innerHTML = `
        <h2>GitHub Profile Stats</h2>
        <dl>
          <dt>Public Repos:</dt><dd>${githubData.public_repos ?? 'N/A'}</dd>
          <dt>Public Gists:</dt><dd>${githubData.public_gists ?? 'N/A'}</dd>
          <dt>Followers:</dt><dd>${githubData.followers ?? 'N/A'}</dd>
          <dt>Following:</dt><dd>${githubData.following ?? 'N/A'}</dd>
        </dl>
    `;
}

// Run both functions
(async function initialize() {
    await loadProjects();
    await loadGitHubProfile();
})();

