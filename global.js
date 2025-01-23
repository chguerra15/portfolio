console.log('IT’S ALIVE!');

// Utility function to query elements
function $$(selector, context = document) {
    console.log(`Querying elements with selector: "${selector}"`);
    return Array.from(context.querySelectorAll(selector));
}

// Pages array for navigation links
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
    console.log(`Processing page: "${title}", ARE_WE_HOME: ${ARE_WE_HOME}`);

    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
        console.log(`Updated relative URL for "${title}": ${url}`);
    }

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    // Highlight current page
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

    // Open external links in a new tab
    if (a.host !== location.host) {
        a.target = '_blank';
        console.log(`Set target="_blank" for external link: "${title}"`);
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

// Function to apply and save the selected color scheme
function setColorScheme(scheme) {
    console.log(`Applying color scheme: "${scheme}"`);

    // Remove any existing theme classes
    document.body.classList.remove('light', 'dark');

    // Apply theme-specific class
    if (scheme === 'light') {
        document.body.classList.add('light');
    } else if (scheme === 'dark') {
        document.body.classList.add('dark');
    }

    // Save the user's preference to localStorage
    localStorage.setItem('colorScheme', scheme);
    select.value = scheme; // Update dropdown value

    console.log(`Color scheme "${scheme}" applied and saved to localStorage.`);
}

// Event listener for theme selection
select.addEventListener('input', (event) => {
    const scheme = event.target.value;
    console.log(`Theme selector changed to: "${scheme}"`);
    setColorScheme(scheme);
});

// Load the saved theme or default to automatic
const savedScheme = localStorage.getItem('colorScheme') || 'auto';
console.log(`Loaded saved theme: "${savedScheme}"`);
setColorScheme(savedScheme);

console.log('Theme system initialized.');

// Get a reference to the form
const form = document.querySelector('#contact-form');

// Add an event listener for form submission
form?.addEventListener('submit', (event) => {
    // Prevent default form submission
    event.preventDefault();

    // Create a FormData object to collect form values
    const data = new FormData(form);

    // Initialize an object to hold encoded form data
    const params = {};

    // Iterate over the form data and encode each value
    for (const [key, value] of data.entries()) {
        params[key] = encodeURIComponent(value);
    }

    // Construct the mailto link with encoded data
    const mailtoLink = `mailto:christianguerra030@gmail.com?subject=${params.subject}&body=${params.body}%0A%0AFrom: ${params.email}`;

    // Open the mailto link in the user's email client
    window.location.href = mailtoLink;
});

