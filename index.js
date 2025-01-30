import { fetchGitHubData } from '../global.js';

async function fetchLatestRepos(username, count = 3) {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=created&per_page=${count}`);
    if (!response.ok) {
        console.error(`GitHub API request failed: ${response.statusText}`);
        return [];
    }
    return await response.json();
}

async function loadProjects() {
    const projectsContainer = document.querySelector('.projects');

    if (!projectsContainer) return;

    projectsContainer.innerHTML = "<p>Loading projects...</p>";

    const repos = await fetchLatestRepos('chguerra15', 3);

    if (!repos || repos.length === 0) {
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
