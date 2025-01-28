import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2');
import { fetchGitHubData } from './global.js';

async function loadGitHubProfile() {
    const profileStats = document.querySelector('#profile-stats');
    
    if (!profileStats) {
        console.error('GitHub profile container not found.');
        return;
    }

    const githubData = await fetchGitHubData('chguerra15'); // Your GitHub username

    if (!githubData) {
        profileStats.innerHTML = "<p>Failed to load GitHub data.</p>";
        return;
    }

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

loadGitHubProfile();


