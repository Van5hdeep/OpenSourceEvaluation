document.addEventListener("DOMContentLoaded", () => {
  const API_KEYS = {
    openWeather: "2468be3d3749c37565dccea5e18e3a57",
    aqi: "c377a2cfbdfd5b9a4174aeed96f7c42457cbed62",
  };

  const dashboardHeading = document.getElementById("dashboard-heading");
  const currentTempEl = document.getElementById("current-temp");
  const weatherDescEl = document.getElementById("weather-description");
  const weatherChartCanvas = document
    .getElementById("weatherChart")
    .getContext("2d");
  const aqiChartCanvas = document.getElementById("aqiChart").getContext("2d");

  const charts = { weather: null, aqi: null };

  async function getCoordsForCity(cityName) {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEYS.openWeather}`;
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Geocoding failed: ${response.statusText}`);
    const data = await response.json();
    if (data.length === 0) throw new Error(`City not found: "${cityName}".`);
    const result = data[0];
    return {
      lat: result.lat,
      lon: result.lon,
      name: `${result.name}, ${result.country}`,
    };
  }

  async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&current_weather=true`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather API failed");
    return await response.json();
  }

  async function fetchAqi(lat, lon) {
    const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${API_KEYS.aqi}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("AQI API failed");
    return await response.json();
  }

  function updateWeatherUI(weatherData) {
    currentTempEl.textContent = `${Math.round(
      weatherData.current_weather.temperature
    )}°C`;
    weatherDescEl.textContent = interpretWeatherCode(
      weatherData.current_weather.weathercode
    );
    createWeatherChart(weatherData);
  }

  function createWeatherChart(weatherData) {
    if (charts.weather) charts.weather.destroy();
    const hourly = weatherData.hourly;
    const labels = hourly.time
      .slice(0, 24)
      .map((t) => new Date(t).getHours() + ":00");
    const data = hourly.temperature_2m.slice(0, 24);
    charts.weather = new Chart(weatherChartCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: chartOptions(),
    });
  }

  function createAqiChart(aqiData) {
    if (charts.aqi) charts.aqi.destroy();
    const aqi = aqiData.data.aqi;
    if (aqi === undefined) return;
    let gaugeColor;
    if (aqi <= 50) gaugeColor = "#22c55e";
    else if (aqi <= 100) gaugeColor = "#f59e0b";
    else gaugeColor = "#ef4444";
    const aqiGaugeText = {
      id: "aqiGaugeText",
      beforeDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        const x = chart.getDatasetMeta(0).data[0].x;
        const y = chart.getDatasetMeta(0).data[0].y;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 50px Poppins";
        ctx.fillStyle = gaugeColor;
        ctx.fillText(aqi, x, y - 15);
        ctx.font = "18px Poppins";
        ctx.fillStyle = "#9ca3af";
        ctx.fillText("AQI", x, y + 25);
        ctx.restore();
      },
    };
    charts.aqi = new Chart(aqiChartCanvas, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [aqi, Math.max(0, 300 - aqi)],
            backgroundColor: [gaugeColor, "#374151"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        rotation: 270,
        circumference: 180,
        cutout: "75%",
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
      plugins: [aqiGaugeText],
    });
  }

  function chartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { grid: { color: "#374151" }, ticks: { color: "#9ca3af" } },
        x: { grid: { display: false }, ticks: { color: "#9ca3af" } },
      },
      plugins: { legend: { display: false } },
    };
  }

  function interpretWeatherCode(code) {
    const codes = {
      0: "Clear Sky",
      1: "Mainly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      61: "Slight Rain",
    };
    return codes[code] || "Conditions";
  }

  async function loadDashboard(cityName) {
    if (!cityName) {
      alert("No city selected. Redirecting to homepage.");
      window.location.href = "index.html";
      return;
    }
    dashboardHeading.textContent = `Loading data for ${cityName}...`;

    try {
      const city = await getCoordsForCity(cityName);
      dashboardHeading.textContent = `Live Metrics: ${city.name}`;

      const [weatherData, aqiData] = await Promise.all([
        fetchWeather(city.lat, city.lon),
        fetchAqi(city.lat, city.lon),
      ]);

      if (weatherData) updateWeatherUI(weatherData);
      if (aqiData.status === "ok") createAqiChart(aqiData);
    } catch (error) {
      console.error("Critical Error:", error);
      dashboardHeading.textContent = `Could not find "${cityName}"`;
      alert(error.message);
    }
  }

  function initializeDashboard() {
    const urlParams = new URLSearchParams(window.location.search);
    const cityFromURL = urlParams.get("city");
    loadDashboard(cityFromURL);
  }

  initializeDashboard();
});