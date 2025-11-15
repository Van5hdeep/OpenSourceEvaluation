document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-right-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('toggle');
            navMenu.classList.toggle('nav-active');
            
            document.body.classList.toggle('nav-open');
        });
    }
});