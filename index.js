import { fetchJSON, fetchLatestRepos } from './global.js';

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

    // ✅ Render only the latest 3 projects
    projects.slice(0, 3).forEach(project => {
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
    console.log('Fetching GitHub profile...');

    const profileStats = document.querySelector('#profile-stats');

    if (!profileStats) {
        console.error('GitHub profile container not found.');
        return;
    }

    if (profileStats.dataset.loaded) {
        console.warn('GitHub stats already loaded, skipping duplicate fetch.');
        return;
    }

    profileStats.dataset.loaded = "true";
    profileStats.innerHTML = "<p>Loading GitHub data...</p>";

    try {
        const githubData = await fetchJSON('https://api.github.com/users/chguerra15');

        if (!githubData || Object.keys(githubData).length === 0) {
            throw new Error('GitHub data is missing or empty.');
        }

        profileStats.innerHTML = `
            <h2>GitHub Profile Stats</h2>
            <div class="github-stat-container">
                <div class="github-stat"><dt>Followers</dt><dd>${githubData.followers ?? 0}</dd></div>
                <div class="github-stat"><dt>Following</dt><dd>${githubData.following ?? 0}</dd></div>
                <div class="github-stat"><dt>Public Repos</dt><dd>${githubData.public_repos ?? 0}</dd></div>
                <div class="github-stat"><dt>Public Gists</dt><dd>${githubData.public_gists ?? 0}</dd></div>
            </div>
        `;

        console.log('GitHub profile stats loaded successfully.');
    } catch (error) {
        console.error('Failed to fetch GitHub data:', error);
        profileStats.innerHTML = "<p>GitHub data unavailable.</p>";
    }
}

// ✅ Ensure both functions load correctly
(async function initialize() {
    await loadProjects();
    await loadGitHubProfile();
})();
