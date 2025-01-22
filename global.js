console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Define the pages array
let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'CV/', title: 'CV' },
    { url: 'https://github.com/chguerra15', title: 'GitHub' },
];

// Create the <nav> element
let nav = document.createElement('nav');
document.body.prepend(nav);

// Dynamically generate navigation links
for (let p of pages) {
    let url = p.url;
    let title = p.title;

    // Check if the page is not the home page and adjust relative paths
    const ARE_WE_HOME = document.documentElement.classList.contains('home');
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }

    // Create the <a> element
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    // Highlight the current page
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

    // Add target="_blank" for external links
    if (a.host !== location.host) {
        a.target = '_blank';
    }

    // Append the link to the <nav>
    nav.append(a);
}
