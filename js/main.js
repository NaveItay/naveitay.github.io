// Select DOM Items
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// Set Initial State of Menu
let showMenu = false;

hamburger.addEventListener('click', () => {
    // Toggle Menu Visibility
    navLinks.classList.toggle('nav-active');

    // Animate Hamburger Icon
    hamburger.classList.toggle('toggle');

    // Prevent Scrolling When Menu is Open
    if (navLinks.classList.contains('nav-active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
});
