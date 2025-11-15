document.addEventListener("DOMContentLoaded", () => {
  const mockData = {
    delhi: {
      weather: {
        current_weather: { temperature: 28.5, weathercode: 1 },
        hourly: {
          time: [
            "2025-11-15T00:00", "2025-11-15T01:00", "2025-11-15T02:00", "2025-11-15T03:00", "2025-11-15T04:00", "2025-11-15T05:00",
            "2025-11-15T06:00", "2025-11-15T07:00", "2025-11-15T08:00", "2025-11-15T09:00", "2025-11-15T10:00", "2025-11-15T11:00",
            "2025-11-15T12:00", "2025-11-15T13:00", "2025-11-15T14:00", "2025-11-15T15:00", "2025-11-15T16:00", "2025-11-15T17:00",
            "2025-11-15T18:00", "2025-11-15T19:00", "2025-11-15T20:00", "2025-11-15T21:00", "2025-11-15T22:00", "2025-11-15T23:00",
          ],
          temperature_2m: [
            25.1, 24.5, 24.0, 23.6, 23.2, 23.0, 23.5, 24.8, 26.5, 28.1, 29.5, 30.6,
            31.2, 31.5, 31.4, 30.8, 29.9, 28.7, 27.8, 27.1, 26.5, 26.0, 25.5, 25.0
          ],
        },
      },
      aqi: { status: "ok", data: { aqi: 385 } },
      displayName: "Delhi, IN"
    },
    mumbai: {
      weather: {
        current_weather: { temperature: 29.8, weathercode: 2 },
        hourly: {
           time: [
            "2025-11-15T00:00", "2025-11-15T01:00", "2025-11-15T02:00", "2025-11-15T03:00", "2025-11-15T04:00", "2025-11-15T05:00",
            "2025-11-15T06:00", "2025-11-15T07:00", "2025-11-15T08:00", "2025-11-15T09:00", "2025-11-15T10:00", "2025-11-15T11:00",
            "2025-11-15T12:00", "2025-11-15T13:00", "2025-11-15T14:00", "2025-11-15T15:00", "2025-11-15T16:00", "2025-11-15T17:00",
            "2025-11-15T18:00", "2025-11-15T19:00", "2025-11-15T20:00", "2025-11-15T21:00", "2025-11-15T22:00", "2025-11-15T23:00",
          ],
          temperature_2m: [
            28.2, 28.0, 27.8, 27.6, 27.5, 27.4, 27.6, 28.1, 28.9, 29.7, 30.4, 31.0,
            31.3, 31.5, 31.4, 31.0, 30.5, 29.9, 29.4, 29.0, 28.7, 28.5, 28.3, 28.1
          ],
        },
      },
      aqi: { status: "ok", data: { aqi: 159 } },
      displayName: "Mumbai, IN"
    },
    bengaluru: {
       weather: {
        current_weather: { temperature: 23.2, weathercode: 3 },
        hourly: {
          time: [
            "2025-11-15T00:00", "2025-11-15T01:00", "2025-11-15T02:00", "2025-11-15T03:00", "2025-11-15T04:00", "2025-11-15T05:00",
            "2025-11-15T06:00", "2025-11-15T07:00", "2025-11-15T08:00", "2025-11-15T09:00", "2025-11-15T10:00", "2025-11-15T11:00",
            "2025-11-15T12:00", "2025-11-15T13:00", "2025-11-15T14:00", "2025-11-15T15:00", "2025-11-15T16:00", "2025-11-15T17:00",
            "2025-11-15T18:00", "2025-11-15T19:00", "2025-11-15T20:00", "2025-11-15T21:00", "2025-11-15T22:00", "2025-11-15T23:00",
          ],
          temperature_2m: [
            21.5, 21.2, 21.0, 20.8, 20.6, 20.5, 20.8, 21.5, 22.8, 24.0, 25.1, 25.8,
            26.2, 26.4, 26.3, 25.8, 25.1, 24.3, 23.5, 22.9, 22.4, 22.0, 21.8, 21.6
          ],
        },
      },
      aqi: { status: "ok", data: { aqi: 122 } },
      displayName: "Bengaluru, IN"
    }
  };

  const API_KEYS = {
    openWeather: "YOUR_OPENWEATHERMAP_API_KEY", // You can leave this blank if only using mock data
    aqi: "YOUR_AQI_API_TOKEN", // You can leave this blank if only using mock data
  };

  const dashboardHeading = document.getElementById("dashboard-heading");
  const currentTempEl = document.getElementById("current-temp");
  const weatherDescEl = document.getElementById("weather-description");
  const weatherChartCanvas = document.getElementById("weatherChart").getContext("2d");
  const aqiChartCanvas = document.getElementById("aqiChart").getContext("2d");
  const charts = { weather: null, aqi: null };

  async function getCoordsForCity(cityName) {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEYS.openWeather}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Geocoding failed: ${response.statusText}`);
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
    currentTempEl.textContent = `${Math.round(weatherData.current_weather.temperature)}°C`;
    weatherDescEl.textContent = interpretWeatherCode(weatherData.current_weather.weathercode);
    createWeatherChart(weatherData);
  }

  function createWeatherChart(weatherData) {
    if (charts.weather) charts.weather.destroy();
    const hourly = weatherData.hourly;
    const labels = hourly.time.slice(0, 24).map((t) => new Date(t).getHours() + ":00");
    const data = hourly.temperature_2m.slice(0, 24);
    charts.weather = new Chart(weatherChartCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Temperature (°C)",
          data,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          fill: true,
          tension: 0.4,
        }, ],
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
        datasets: [{
          data: [aqi, Math.max(0, 300 - aqi)],
          backgroundColor: [gaugeColor, "#374151"],
          borderWidth: 0,
        }, ],
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
    const codes = { 0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast", 61: "Slight Rain" };
    return codes[code] || "Conditions";
  }

  async function loadDashboard(cityName) {
    const normalizedCity = cityName ? cityName.trim().toLowerCase() : "";

    if (!normalizedCity) {
      alert("No city selected. Redirecting to homepage.");
      window.location.href = "index.html";
      return;
    }

    dashboardHeading.textContent = `Loading data for ${cityName}...`;

    // *** MODIFIED LOGIC: Check for mock data first ***
    if (mockData[normalizedCity]) {
      const cityData = mockData[normalizedCity];
      dashboardHeading.textContent = `Live Metrics: ${cityData.displayName}`;
      updateWeatherUI(cityData.weather);
      createAqiChart(cityData.aqi);
      return; // Stop here and don't call the API
    }

    // If it's not a mock city, try the API
    try {
      if (!API_KEYS.openWeather || !API_KEYS.aqi) {
         throw new Error("API keys are not configured. Cannot fetch live data.");
      }
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
      dashboardHeading.textContent = `Could not find data for "${cityName}"`;
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