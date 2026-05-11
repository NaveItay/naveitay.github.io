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

function isSiteReducedMotionEnabled() {
  if (typeof isReducedMotionRequested === 'function') {
    return isReducedMotionRequested();
  }

  return Boolean(
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
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
  // Bind only if the contact form exists on this page (avoid noisy console errors)
  const form = document.querySelector('form[name="contact-form"]');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission

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
          form.reset(); // Clear form fields
        } else {
          alert('There was a problem sending your message.');
        }
      })
      .catch(() => {
        alert('Error: Could not send the message.');
      });
  });
});

// === OUR SYSTEMS - desktop center carousel + mobile horizontal belt ===
document.addEventListener('DOMContentLoaded', function () {
  const root = document.querySelector('#our-systems .systems-carousel');
  if (!root) return;

  const stage = root.querySelector('.systems-stage');
  const cards = Array.from(stage.querySelectorAll('.systems-card'));
  const pips = Array.from(root.querySelectorAll('.pip'));

  const intervalMs = parseInt(root.dataset.interval, 10) || 5000;
  let current = 1; // להתחיל מהשקופית האמצעית (לשימור ההתנהגות)
  let timer = null;

  const isMobileLayout = () => getComputedStyle(stage).display === 'flex';

  // עדכון מצב פריסה + נקודות
  function layout() {
    const n = cards.length;
    const left = (current - 1 + n) % n;
    const right = (current + 1) % n;

    if (!isMobileLayout()) {
      // מצב דסקטופ - 3D
      cards.forEach((card, i) => {
        let pos = 'off';
        if (i === current) pos = '0';
        else if (i === left) pos = '-1';
        else if (i === right) pos = '1';
        card.dataset.pos = pos;
        card.setAttribute('aria-hidden', pos !== '0');
      });
    } else {
      // מובייל - כולם גלויים, בלי ARIA hide
      cards.forEach(card => {
        card.dataset.pos = '';
        card.removeAttribute('aria-hidden');
      });
    }

    pips.forEach((pip, i) => {
      const on = i === current;
      pip.classList.toggle('is-active', on);
      pip.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  // גלילה רכה לכרטיס המבוקש במובייל
  function scrollToCard(i) {
    const card = cards[i];
    if (!card) return;
    const left = card.offsetLeft; // יחסי לתוכן ה-stage
    stage.scrollTo({ left, behavior: 'smooth' });
  }

  function next() {
    current = (current + 1) % cards.length;
    if (isMobileLayout()) scrollToCard(current);
    layout();
  }

  function prev() {
    current = (current - 1 + cards.length) % cards.length;
    if (isMobileLayout()) scrollToCard(current);
    layout();
  }

  function start() {
    stop();
    if (isSiteReducedMotionEnabled()) return;
    timer = setInterval(next, intervalMs);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // Init
  layout();
  start();

  // אינטראקציות
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  pips.forEach((pip, i) => {
    pip.addEventListener('click', () => {
      current = i;
      isMobileLayout() ? scrollToCard(i) : layout();
      start(); // לחדש טיימר
    });
  });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); start(); }
    if (e.key === 'ArrowLeft') { prev(); start(); }
  });

  stage.addEventListener('click', () => { next(); start(); });

  // סנכרון אינדקס בזמן גלילה ידנית במובייל
  let raf;
  stage.addEventListener('scroll', () => {
    if (!isMobileLayout()) return;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const mid = stage.scrollLeft + stage.clientWidth / 2;
      let best = 0, bestDist = Infinity;
      cards.forEach((c, i) => {
        const cx = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(cx - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      if (best !== current) { current = best; layout(); }
    });
  }, { passive: true });

  // השהיית אוטופליי כשלא בפריים
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => entry.isIntersecting ? start() : stop());
  }, { threshold: 0.5 });
  io.observe(root);

  // כיבוד מתג motion מהסרגל + שינויי פריסה (ריסייז)
  document.addEventListener('site-accessibility-change', (e) => {
    e.detail?.reducedMotion ? stop() : start();
  });
  window.addEventListener('resize', layout);
});

document.addEventListener('DOMContentLoaded', function () {
  function syncMotionWithMedia() {
    const shouldReduce = isSiteReducedMotionEnabled();
    document.querySelectorAll('.video-section video').forEach(v => {
      if (shouldReduce) { v.pause(); }
      else { v.play().catch(() => { }); }
    });
  }

  syncMotionWithMedia();
  document.addEventListener('site-accessibility-change', syncMotionWithMedia);
});

// Render support@eats-systems.com without exposing a plain mailto to scrapers
(function () {
  var u = "support";
  var d = "eats-systems.com";
  var e = u + "@" + d;
  var a = document.createElement("a");
  a.href = "mailto:" + e;
  a.textContent = e;
  a.rel = "nofollow";
  var slot = document.getElementById("support-email");
  if (slot) slot.replaceChildren(a);
})();

// Footer section and other partials inclusion

async function includePartials() {
  const nodes = document.querySelectorAll('[data-include]');
  for (const el of nodes) {
    const url = el.getAttribute('data-include');
    try {
      const res = await fetch(url, { cache: 'no-store' }); // change to 'default' if you want caching
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      el.outerHTML = html;
    } catch (err) {
      console.error('Include failed:', url, err);
    }
  }

  // Optional: let other scripts know includes finished
  document.dispatchEvent(new CustomEvent('partials:loaded'));
}

// If main.js is loaded with `defer` or at the end of <body>, this is fine:
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', includePartials);
} else {
  includePartials();
}
