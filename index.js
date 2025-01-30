import { fetchJSON } from './global.js';

async function fetchLatestRepos(username, count = 3) {
    try {
        console.log(`Fetching latest ${count} repos for ${username}...`);
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=created&per_page=${count}`);

        if (!response.ok) {
            throw new Error(`GitHub API request failed: ${response.statusText}`);
        }

        const repos = await response.json();
        console.log('Fetched GitHub Repos:', repos);
        return repos.slice(0, count); // Ensure we only take the last 'count' repos
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

    let projects = await fetchJSON('./lib/projects.json');

    if (!projects || projects.length === 0) {
        console.warn('No projects found in JSON file. Fetching from GitHub instead...');
        projects = await fetchLatestRepos('chguerra15', 3);
    }

    if (!projects || projects.length === 0) {
        projectsContainer.innerHTML = "<p>No projects available.</p>";
        return;
    }

    projectsContainer.innerHTML = '';

    // ✅ Ensure only 3 projects are rendered
    const latestProjects = projects.slice(0, 3);

    latestProjects.forEach(project => {
        const article = document.createElement('article');
        article.innerHTML = `
            <h2>${project.title ?? project.name}</h2>
            <p>${project.description ?? 'No description available.'}</p>
            <a href="${project.html_url ?? '#'}" target="_blank">View on GitHub</a>
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

    // Prevent duplicate rendering
    if (profileStats.dataset.loaded) {
        console.warn('GitHub stats already loaded, skipping duplicate fetch.');
        return;
    }
    profileStats.dataset.loaded = "true";

    profileStats.innerHTML = "<p>Loading GitHub data...</p>";

    const githubData = await fetchJSON('https://api.github.com/users/chguerra15');

    if (!githubData || Object.keys(githubData).length === 0) {
        console.error('GitHub data is missing or empty.');
        profileStats.innerHTML = "<p>GitHub data unavailable.</p>";
        return;
    }

    console.log('GitHub data loaded successfully:', githubData);

    profileStats.innerHTML = `
        <div class="github-card">
            <h2>My GitHub Stats</h2>
            <dl class="github-stats">
                <div class="github-stat"><dt>Followers</dt><dd>${githubData.followers ?? 'N/A'}</dd></div>
                <div class="github-stat"><dt>Following</dt><dd>${githubData.following ?? 'N/A'}</dd></div>
                <div class="github-stat"><dt>Public Repos</dt><dd>${githubData.public_repos ?? 'N/A'}</dd></div>
                <div class="github-stat"><dt>Public Gists</dt><dd>${githubData.public_gists ?? 'N/A'}</dd></div>
            </dl>
        </div>
    `;
}

// Run both functions, ensuring GitHub stats only load once
(async function initialize() {
    await loadProjects();
    if (!document.querySelector('#profile-stats').dataset.loaded) {
        await loadGitHubProfile();
    }
})();
