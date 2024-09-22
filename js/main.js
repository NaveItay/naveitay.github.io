// main.js

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        // Toggle navigation menu visibility
        navLinks.classList.toggle('nav-active');

        // Animate hamburger icon
        hamburger.classList.toggle('toggle');

        // Toggle body class to hide scrollbar when menu is open
        document.body.classList.toggle('menu-open');

        // Update aria-expanded attribute for accessibility
        const expanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !expanded);
    });
});
