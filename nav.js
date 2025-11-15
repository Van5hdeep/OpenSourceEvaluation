document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-right-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            // Toggle classes for menu and hamburger animation
            hamburger.classList.toggle('toggle');
            navMenu.classList.toggle('nav-active');
            
            // Toggle a class on the body for the overlay and scroll lock
            document.body.classList.toggle('nav-open');
        });
    }
});