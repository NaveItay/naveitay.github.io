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

// === OUR SYSTEMS – centered carousel with auto-play ===
document.addEventListener('DOMContentLoaded', function () {
  const root = document.querySelector('#our-systems .systems-carousel');
  if (!root) return;

  const stage = root.querySelector('.systems-stage');
  const cards = Array.from(stage.querySelectorAll('.systems-card'));
  const pips = Array.from(root.querySelectorAll('.pip'));

  const intervalMs = parseInt(root.dataset.interval, 10) || 5000;
  let current = 1; // מתחילים מהשקופית האמצעית (WIFIGATE)
  let timer = null;

  // A11y ids for tabs/controls
  cards.forEach((card, i) => {
    const id = `system-slide-${i + 1}`;
    card.id = id;
    if (pips[i]) pips[i].setAttribute('aria-controls', id);
  });

  function layout() {
    const n = cards.length;
    const left = (current - 1 + n) % n;
    const right = (current + 1) % n;

    cards.forEach((card, i) => {
      let pos = 'off';
      if (i === current) pos = '0';
      else if (i === left) pos = '-1';
      else if (i === right) pos = '1';
      card.dataset.pos = pos;
      card.setAttribute('aria-hidden', pos !== '0');
    });

    pips.forEach((pip, i) => {
      pip.classList.toggle('is-active', i === current);
      pip.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  function next() {
    current = (current + 1) % cards.length;
    layout();
  }
  function prev() {
    current = (current - 1 + cards.length) % cards.length;
    layout();
  }

  function start() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stop();
    timer = setInterval(next, intervalMs);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // Init
  layout();
  start();

  // Interactions
  // Pause on hover, resume on leave
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  // Click dots
  pips.forEach((pip, i) => {
    pip.addEventListener('click', () => {
      current = i;
      layout();
      start();
    });
  });

  // Keyboard navigation when focused inside the carousel
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); start(); }
    if (e.key === 'ArrowLeft') { prev(); start(); }
  });

  // Advance on click/tap anywhere on the stage
  stage.addEventListener('click', () => { next(); start(); });

  // Pause when off-screen to save CPU/battery
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => entry.isIntersecting ? start() : stop());
  }, { threshold: 0.5 });
  io.observe(root);
});
