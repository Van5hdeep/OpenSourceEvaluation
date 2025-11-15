document.addEventListener("DOMContentLoaded", () => {
  const dashboardButton = document.querySelector(".btn-dashboard");

  const cityInput = document.querySelector('.cities input[type="text"]');

  function navigateToDashboard() {
    const cityName = cityInput.value.trim().toLowerCase();

    if (cityName) {
      window.location.href = `dashboard.html?city=${encodeURIComponent(
        cityName
      )}`;
    } else {
      alert("Please enter a city name.");
    }
  }
  dashboardButton.addEventListener("click", navigateToDashboard);
  cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      navigateToDashboard();
    }
  });
});
