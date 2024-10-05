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

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
            document.body.classList.toggle('menu-open');
            const expanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !expanded);
        });

        const navLinkItems = document.querySelectorAll('.nav-links a');

        navLinkItems.forEach(link => {
            link.addEventListener('click', e => {
                const href = link.getAttribute('href');

                if (href.startsWith('/#')) {
                    e.preventDefault();
                    const targetId = href.substring(2);
                    const targetSection = document.getElementById(targetId);

                    if (targetSection) {
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    } else {
                        // If the target section is not found, navigate to the homepage with the hash
                        window.location.href = href;
                    }

                    if (navLinks.classList.contains('nav-active')) {
                        navLinks.classList.remove('nav-active');
                        hamburger.classList.remove('toggle');
                        document.body.classList.remove('menu-open');
                        hamburger.setAttribute('aria-expanded', false);
                    }
                } else {
                    if (navLinks.classList.contains('nav-active')) {
                        navLinks.classList.remove('nav-active');
                        hamburger.classList.remove('toggle');
                        document.body.classList.remove('menu-open');
                        hamburger.setAttribute('aria-expanded', false);
                    }
                }
            });
        });
    } else {
        console.error('Navigation elements not found. Header may not have loaded correctly.');
    }
}

// Scroll to section if URL contains a hash
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash;

    if (hash) {
        const targetId = hash.substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            setTimeout(() => {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 0);
        }
    }
});

// Function to handle form submission and clear form fields
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form[name="contact-form"]');

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();  // Prevent the default form submission

            // Get form data
            const formData = new FormData(form);

            // Perform form submission via AJAX (optional)
            fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        alert('Message sent successfully!');
                        form.reset();  // Clear form fields
                    } else {
                        alert('There was a problem sending your message.');
                    }
                })
                .catch(error => {
                    alert('Error: Could not send the message.');
                });
        });
    } else {
        console.error('Contact form not found.');
    }
});
