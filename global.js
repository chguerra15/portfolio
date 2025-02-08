console.log('IT’S ALIVE!');

function $$(selector, context = document) {
    console.log(`Querying elements with selector: "${selector}"`);
    return Array.from(context.querySelectorAll(selector));
}

// NAVIGATION MENU
let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'CV/', title: 'CV' },
    { url: 'https://github.com/chguerra15', title: 'GitHub' },
];

console.log('Creating navigation menu...');
let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    const ARE_WE_HOME = document.documentElement.classList.contains('home');
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    a.classList.toggle('current', a.host === location.host && a.pathname === location.pathname);

    if (a.host !== location.host) {
        a.target = '_blank';
    }

    nav.append(a);
}
console.log('Navigation menu created.');

// THEME SELECTOR
document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select id="theme-select">
              <option value="auto">Automatic</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
          </select>
      </label>
    `
);

const select = document.querySelector('#theme-select');

function setColorScheme(scheme) {
    document.body.classList.remove('light', 'dark');
    if (scheme === 'light') document.body.classList.add('light');
    if (scheme === 'dark') document.body.classList.add('dark');
    localStorage.setItem('colorScheme', scheme);
    select.value = scheme;
}

select.addEventListener('input', (event) => {
    setColorScheme(event.target.value);
});

setColorScheme(localStorage.getItem('colorScheme') || 'auto');

// FETCH JSON FUNCTION
export async function fetchJSON(url) {
    try {
        console.log(`Fetching JSON from: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch JSON: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched JSON:', data);
        return data;
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
        return [];
    }
}

// FETCH AND RENDER PROJECTS ON PROJECTS PAGE
async function loadAllProjects() {
    const projectsContainer = document.querySelector('.projects');

    if (!projectsContainer) {
        console.error("Projects page container not found.");
        return;
    }

    console.log("Fetching all projects...");
    const projects = await fetchJSON('../lib/projects.json');
    console.log("Projects fetched:", projects);

    if (!projects || projects.length === 0) {
        projectsContainer.innerHTML = "<p>No projects available.</p>";
        return;
    }

    projects.forEach(project => {
        const article = document.createElement('article');
        article.innerHTML = `
            <img src="${project.image}" alt="${project.title}">
            <h2>${project.title}</h2>
            <p>${project.description}</p>
            <p class="project-year">${project.year}</p> 
        `;
        projectsContainer.appendChild(article);
    });
}



// Load projects only if on the projects page
if (!document.documentElement.classList.contains('home')) {
    loadAllProjects();
}
