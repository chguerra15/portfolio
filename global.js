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

// FORM HANDLING
const form = document.querySelector('#contact-form');
form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const params = Object.fromEntries(data.entries());
    const mailtoLink = `mailto:christianguerra030@gmail.com?subject=${encodeURIComponent(params.subject)}&body=${encodeURIComponent(params.body)}%0A%0AFrom: ${encodeURIComponent(params.email)}`;
    window.location.href = mailtoLink;
});

// FETCH JSON FUNCTION
export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON:', error);
        return [];
    }
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    if (!containerElement) {
        console.error('Invalid container element');
        return;
    }
    
    containerElement.innerHTML = '';
    
    projects.forEach(project => {
        const article = document.createElement('article');
        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src="${project.image}" alt="${project.title}">
            <p>${project.description}</p>
        `;
        containerElement.appendChild(article);
    });
}