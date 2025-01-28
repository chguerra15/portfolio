console.log('IT’S ALIVE!'); 

function $$(selector, context = document) {
    console.log(`Querying elements with selector: "${selector}"`);
    return Array.from(context.querySelectorAll(selector));
}

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
    console.log(`Processing page: "${title}", ARE_WE_HOME: ${ARE_WE_HOME}`);

    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
        console.log(`Updated relative URL for "${title}": ${url}`);
    }

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

    if (a.host !== location.host) {
        a.target = '_blank';
        console.log(`Set target="_blank" for external link: "${title}"`);
    }

    nav.append(a);
}

console.log('Navigation menu created and injected.');

console.log('Adding theme selector dropdown...');
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
    console.log(`Applying color scheme: "${scheme}"`);

    document.body.classList.remove('light', 'dark');

    if (scheme === 'light') {
        document.body.classList.add('light');
    } else if (scheme === 'dark') {
        document.body.classList.add('dark');
    }

    localStorage.setItem('colorScheme', scheme);
    select.value = scheme; 

    console.log(`Color scheme "${scheme}" applied and saved to localStorage.`);
}

select.addEventListener('input', (event) => {
    const scheme = event.target.value;
    console.log(`Theme selector changed to: "${scheme}"`);
    setColorScheme(scheme);
});

const savedScheme = localStorage.getItem('colorScheme') || 'auto';
console.log(`Loaded saved theme: "${savedScheme}"`);
setColorScheme(savedScheme);

console.log('Theme system initialized.');

const form = document.querySelector('#contact-form');

form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);

    const params = {};

    for (const [key, value] of data.entries()) {
        params[key] = encodeURIComponent(value);
    }

    const mailtoLink = `mailto:christianguerra030@gmail.com?subject=${params.subject}&body=${params.body}%0A%0AFrom: ${params.email}`;

    window.location.href = mailtoLink;
});

export async function fetchJSON(url) {
    try {
        console.log(`Fetching JSON from URL: "${url}"`); 
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Failed to fetch projects: ${response.statusText}`);
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        console.log(`Successfully fetched JSON from URL: "${url}"`); 
        const data = await response.json();
        console.log('Fetched Data:', data); 
        return data;
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

export function renderProjects(project, containerElement) {
    if (!containerElement) {
        console.error("Container element is invalid.");
        return;
    }

    console.log(`Rendering project: "${project.title}"`); 
    const article = document.createElement("article");

    const img = document.createElement("img");
    img.src = project.image && project.image !== "" ? project.image : "../images/coming-soon.jpg";
    img.alt = project.title || "Image coming soon";

    const h2 = document.createElement("h2");
    h2.textContent = project.title;

    const p = document.createElement("p");
    p.textContent = project.description;

    article.appendChild(img);
    article.appendChild(h2);
    article.appendChild(p);

    containerElement.appendChild(article);
    console.log(`Project "${project.title}" rendered successfully.`);
}

console.log('Fetching and rendering projects...');
fetchJSON('../lib/projects.json').then(projects => {
    const container = document.querySelector('.projects');
    if (container) {
        console.log('Rendering projects into the container...');
        projects.forEach(project => renderProjects(project, container));
        console.log('All projects rendered successfully.');
    } else {
        console.error('Projects container not found.');
    }
});
