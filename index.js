import { fetchJSON } from '../global.js';

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

    let projects = await fetchJSON('../lib/projects.json');

    if (!projects || projects.length === 0) {
        console.warn('No projects found in JSON file. Fetching from GitHub instead...');
        projects = await fetchLatestRepos('chguerra15', 3);
    }

    if (!projects || projects.length === 0) {
        projectsContainer.innerHTML = "<p>No projects available.</p>";
        return;
    }

    projectsContainer.innerHTML = '';

    projects.forEach(project => {
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
