console.log('IT’S ALIVE!');

function $$(selector, context = document) {
    console.log(`Querying elements with selector: ${selector}`);
    return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'CV/', title: 'CV' },
    { url: 'https://github.com/chguerra15', title: 'GitHub' },
];

// Create and inject the navigation menu
console.log('Creating navigation menu...');
let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    const ARE_WE_HOME = document.documentElement.classList.contains('home');
    console.log(`Processing page: ${title}, ARE_WE_HOME: ${ARE_WE_HOME}`);

    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
        console.log(`Updated relative URL for ${title}: ${url}`);
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
        console.log(`Set target="_blank" for external link: ${title}`);
    }

    nav.append(a);
}

console.log('Navigation menu created and injected.');

// Add theme selector dropdown to the page
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
const root = document.documentElement;

// Function to set and save the color scheme
function setColorScheme(scheme) {
    console.log(`Applying color scheme: ${scheme}`);
    root.style.setProperty('color-scheme', scheme === 'auto' ? '' : scheme); // Apply theme
    localStorage.colorScheme = scheme; // Save user preference
    select.value = scheme; // Update dropdown value
    console.log(`Color scheme set to ${scheme} and saved to localStorage.`);
}

// Event listener for theme selection
select.addEventListener('input', function (event) {
    const scheme = event.target.value;
    console.log('Theme selector changed:', scheme);
    setColorScheme(scheme);
});

// Load saved theme or default to auto
if ('colorScheme' in localStorage) {
    console.log(`Found saved theme in localStorage: ${localStorage.colorScheme}`);
    setColorScheme(localStorage.colorScheme);
} else {
    console.log('No saved theme found in localStorage, defaulting to auto.');
    setColorScheme('auto');
}

console.log('Theme system initialized.');
