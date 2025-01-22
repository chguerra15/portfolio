console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'CV/', title: 'CV' },
    { url: 'https://github.com/chguerra15', title: 'GitHub' },
];

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

    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

    if (a.host !== location.host) {
        a.target = '_blank';
    }

    nav.append(a);
}

const select = document.querySelector('#theme-select');
const root = document.documentElement;

function setColorScheme(scheme) {
    root.style.setProperty('color-scheme', scheme === 'auto' ? '' : scheme);
    localStorage.colorScheme = scheme;

    select.value = scheme;
}

select.addEventListener('input', (event) => {
    const scheme = event.target.value;
    console.log('Color scheme changed to:', scheme);
    setColorScheme(scheme);
});

if ('colorScheme' in localStorage) {
    setColorScheme(localStorage.colorScheme);
} else {
    setColorScheme('auto');
}

