import { WeatherData } from '../types';

export const getGeolocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Geolocation denied/failed, using default", error);
        resolve({ lat: 51.5074, lon: -0.1278 }); // Default to London
      }
    );
  });
};

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
    );
    const data = await response.json();
    const cw = data.current_weather;
    
    // WMO Weather interpretation codes (simplified)
    // 0: Clear, 1-3: Cloudy, 45-48: Fog, 51-67: Drizzle/Rain, 71+: Snow, 95+: Thunderstorm
    let condition = "Clear";
    const code = cw.weathercode;
    
    if (code > 0 && code <= 3) condition = "Cloudy";
    else if (code >= 45 && code <= 48) condition = "Foggy";
    else if (code >= 51 && code <= 67) condition = "Rainy";
    else if (code >= 71 && code <= 86) condition = "Snowy";
    else if (code >= 95) condition = "Stormy";

    return {
      temperature: cw.temperature,
      condition: condition,
      isDay: cw.is_day === 1,
      locationName: `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}` // Reverse geocoding requires API key usually, keeping simple
    };
  } catch (error) {
    console.error("Failed to fetch weather", error);
    return {
      temperature: 20,
      condition: "Unknown",
      isDay: true,
      locationName: "Unknown Location"
    };
  }
};