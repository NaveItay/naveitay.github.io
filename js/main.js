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

    // Smooth scrolling for navigation links
    const navLinkItems = document.querySelectorAll('.nav-links a');

    navLinkItems.forEach(link => {
        link.addEventListener('click', e => {
            // Prevent default anchor click behavior
            e.preventDefault();

            // Get the target section's ID from the href attribute
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            // Scroll to the target section smoothly
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Close the mobile menu if it's open
            if (navLinks.classList.contains('nav-active')) {
                navLinks.classList.remove('nav-active');
                hamburger.classList.remove('toggle');
                document.body.classList.remove('menu-open');
                hamburger.setAttribute('aria-expanded', false);
            }
        });
    });
});
