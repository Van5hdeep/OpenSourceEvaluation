window.addEventListener("DOMContentLoaded", () => {

    const toggle = document.getElementById("theme-toggle");
    let currentTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);

    toggle?.addEventListener("click", () => {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", currentTheme);
        localStorage.setItem("theme", currentTheme);
    });

    const form = document.getElementById("loginForm");
    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        e.preventDefault();

        const email = document.getElementById("Email").value;
        const password = document.getElementById("password").value;

        const correctEmail = "abc_test@gmail.com";
        const correctPassword = "admin4";

        if(email === correctEmail && password === correctPassword) {
            alert("Login successful!");
            
            window.location.href = "dashboard.html"; 
        } else {
            alert("Invalid email or password!");
        }
    });

    const googleBtn = document.getElementById("google-signin-btn");
    googleBtn?.addEventListener("click", () => {
        alert("Google Sign-In clicked!");
    });

});
