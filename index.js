import { fetchGitHubData } from '../global.js';

async function fetchLatestRepos(username, count = 3) {
    try {
        console.log(`Fetching latest ${count} repos for ${username}...`);
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=created&per_page=${count}`);

        if (!response.ok) {
            throw new Error(`GitHub API request failed: ${response.statusText}`);
        }

        const repos = await response.json();
        console.log('Fetched Repos:', repos);
        return repos;
    } catch (error) {
        console.error('Error fetching GitHub repositories:', error);
        return [];
    }
}

async function loadProjects() {
    const projectsContainer = document.querySelector('.projects');

    if (!projectsContainer) {
        console.error('Projects container not found.');
        return;
    }

    projectsContainer.innerHTML = "<p>Loading projects...</p>";

    const repos = await fetchLatestRepos('chguerra15', 3);

    if (!repos || repos.length === 0) {
        console.warn('No projects found from GitHub.');
        projectsContainer.innerHTML = "<p>No projects available.</p>";
        return;
    }

    projectsContainer.innerHTML = '';

    repos.forEach(repo => {
        const article = document.createElement('article');
        article.innerHTML = `
            <h2>${repo.name}</h2>
            <p>${repo.description ?? 'No description available.'}</p>
            <a href="${repo.html_url}" target="_blank">View on GitHub</a>
        `;
        projectsContainer.appendChild(article);
    });

    console.log('Latest projects rendered successfully.');
}

async function loadGitHubProfile() {
    const profileStats = document.querySelector('#profile-stats');

    if (!profileStats) {
        console.error('GitHub profile container not found.');
        return;
    }

    profileStats.innerHTML = "<p>Loading GitHub data...</p>";

    const githubData = await fetchGitHubData('chguerra15');

    if (!githubData || Object.keys(githubData).length === 0) {
        console.error('GitHub data is missing or empty.');
        profileStats.innerHTML = "<p>GitHub data unavailable.</p>";
        return;
    }

    profileStats.innerHTML = `
        <h2>My GitHub Stats</h2>
        <div class="github-stats-container">
            <div class="github-stat"><dt>Followers</dt><dd>${githubData.followers ?? 'N/A'}</dd></div>
            <div class="github-stat"><dt>Following</dt><dd>${githubData.following ?? 'N/A'}</dd></div>
            <div class="github-stat"><dt>Public Repos</dt><dd>${githubData.public_repos ?? 'N/A'}</dd></div>
            <div class="github-stat"><dt>Public Gists</dt><dd>${githubData.public_gists ?? 'N/A'}</dd></div>
        </div>
    `;

    console.log('GitHub profile stats loaded successfully.');
}

(async function initialize() {
    await loadProjects();
    await loadGitHubProfile();
})();
