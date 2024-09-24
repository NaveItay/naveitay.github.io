// main.js

// Function to load HTML content
function loadHTML(url, elementId) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById(elementId).innerHTML = data;

            // After the header is loaded, initialize the navigation menu
            initNavigation();
        })
        .catch(error => console.error('Error loading the HTML file:', error));
}

// Load the header
loadHTML('/header.html', 'header-placeholder');

// Function to initialize the navigation menu
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    // Check if hamburger and navLinks exist (header might not have loaded properly)
    if (hamburger && navLinks) {
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
                const href = link.getAttribute('href');

                // Check if link is an anchor link (starts with '#')
                if (href.startsWith('#')) {
                    // Prevent default anchor click behavior
                    e.preventDefault();

                    // Get the target section's ID from the href attribute
                    const targetId = href.substring(1);
                    const targetSection = document.getElementById(targetId);

                    // Scroll to the target section smoothly
                    if (targetSection) {
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
                    }
                } else {
                    // For external links or links to other pages, allow default behavior
                }
            });
        });
    } else {
        console.error('Navigation elements not found. Header may not have loaded correctly.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // The header is loaded asynchronously, so initialization is done after it's loaded.
    // The initNavigation function is called after loading the header in loadHTML().
});
