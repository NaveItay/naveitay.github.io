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

// === OUR SYSTEMS – centered carousel with reduced-motion support ===
document.addEventListener('DOMContentLoaded', function () {
  const root = document.querySelector('#our-systems .systems-carousel');
  if (!root) return;

  const stage = root.querySelector('.systems-stage');
  const cards = Array.from(stage.querySelectorAll('.systems-card'));
  const pips  = Array.from(root.querySelectorAll('.pip'));

  const intervalMs = parseInt(root.dataset.interval, 10) || 5000;
  let current = 1; // start with middle
  let timer = null;

  // A11y ids
  cards.forEach((card, i) => {
    const id = `system-slide-${i + 1}`;
    card.id = id;
    if (pips[i]) pips[i].setAttribute('aria-controls', id);
  });

  function layout() {
    const n = cards.length;
    const left  = (current - 1 + n) % n;
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
      const on = i === current;
      pip.classList.toggle('is-active', on);
      pip.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function next(){ current = (current + 1) % cards.length; layout(); }
  function prev(){ current = (current - 1 + cards.length) % cards.length; layout(); }

  function start(){
    stop();
    if (window.A11Y?.reduce) return;
    timer = setInterval(next, intervalMs);
  }
  function stop(){ if (timer) clearInterval(timer); timer = null; }

  // Init
  layout(); start();

  // Interactions
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  pips.forEach((pip, i) => pip.addEventListener('click', () => {
    current = i; layout(); start();
  }));

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); start(); }
    if (e.key === 'ArrowLeft')  { prev(); start(); }
  });

  stage.addEventListener('click', () => { next(); start(); });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => entry.isIntersecting ? start() : stop());
  }, { threshold: 0.5 });
  io.observe(root);

  // React to global motion toggle
  window.addEventListener('a11y:motion-changed', (e) => {
    e.detail.reduce ? stop() : start();
  });
});

// === Accessibility module & toolbar ===
document.addEventListener('DOMContentLoaded', function(){
  const A11Y = {
    get reduce() {
      const saved = localStorage.getItem('a11y.reduce');
      if (saved !== null) return saved === '1';
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    setReduce(on){
      localStorage.setItem('a11y.reduce', on ? '1' : '0');
      document.body.classList.toggle('reduce-motion', on);
      window.dispatchEvent(new CustomEvent('a11y:motion-changed', { detail: { reduce: on }}));
      announce(`Animations ${on ? 'paused' : 'resumed'}.`);
    },
    get contrast(){ return localStorage.getItem('a11y.contrast') === '1'; },
    setContrast(on){
      localStorage.setItem('a11y.contrast', on ? '1' : '0');
      document.body.classList.toggle('contrast-high', on);
      announce(`High contrast ${on ? 'on' : 'off'}.`);
    },
    get textLg(){ return localStorage.getItem('a11y.textLg') === '1'; },
    setTextLg(on){
      localStorage.setItem('a11y.textLg', on ? '1' : '0');
      document.body.classList.toggle('text-lg', on);
      announce(`Text size ${on ? 'increased' : 'normal'}.`);
    }
  };
  window.A11Y = A11Y;

  // Apply saved state on load
  document.body.classList.toggle('reduce-motion', A11Y.reduce);
  document.body.classList.toggle('contrast-high', A11Y.contrast);
  document.body.classList.toggle('text-lg', A11Y.textLg);

  // Toolbar wiring
  const btnContrast = document.getElementById('btn-contrast');
  const btnMotion   = document.getElementById('btn-motion');
  const btnFont     = document.getElementById('btn-font');
  const setPressed  = (el, on) => el && el.setAttribute('aria-pressed', on ? 'true' : 'false');

  setPressed(btnContrast, A11Y.contrast);
  setPressed(btnMotion,   A11Y.reduce);
  setPressed(btnFont,     A11Y.textLg);

  btnContrast?.addEventListener('click', () => {
    const on = !A11Y.contrast; A11Y.setContrast(on); setPressed(btnContrast, on);
  });
  btnMotion?.addEventListener('click', () => {
    const on = !A11Y.reduce;   A11Y.setReduce(on);   setPressed(btnMotion, on);
    syncMotionWithMedia();
  });
  btnFont?.addEventListener('click', () => {
    const on = !A11Y.textLg;   A11Y.setTextLg(on);   setPressed(btnFont, on);
  });

  // Announcements for SR
  function announce(text){
    const live = document.getElementById('a11y-status');
    if (!live) return;
    live.textContent = '';
    setTimeout(() => (live.textContent = text), 30);
  }

  // Skip link moves focus to main
  const main = document.getElementById('main-content');
  document.querySelector('.skip-link')?.addEventListener('click', () => {
    setTimeout(() => main?.focus(), 0);
  });

  // Pause or play background video according to motion preference
  function syncMotionWithMedia(){
    const shouldReduce = A11Y.reduce;
    document.querySelectorAll('.video-section video').forEach(v => {
      if (shouldReduce) { v.pause(); }
      else { v.play().catch(() => {}); }
    });
  }
  syncMotionWithMedia();
  window.addEventListener('a11y:motion-changed', syncMotionWithMedia);
});
