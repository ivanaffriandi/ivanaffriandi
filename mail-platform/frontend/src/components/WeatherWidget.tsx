'use client';

import React, { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  condition: string;
}

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 29,
    condition: 'Clear Night',
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=1.13&longitude=104.05&current=temperature_2m,weather_code,is_day'
        );
        const data = await res.json();
        if (data && data.current) {
          const temp = Math.round(data.current.temperature_2m);
          const isDay = data.current.is_day === 1;
          const code = data.current.weather_code;

          let condition = 'Clear';
          if (code === 0) condition = isDay ? 'Sunny' : 'Clear Night';
          else if (code >= 1 && code <= 3) condition = isDay ? 'Partly Cloudy' : 'Cloudy Night';
          else if (code >= 45 && code <= 48) condition = 'Foggy';
          else if (code >= 51 && code <= 67) condition = 'Rainy';
          else if (code >= 80 && code <= 82) condition = 'Showers';
          else if (code >= 95) condition = 'Thunderstorm';

          setWeather({ temp, condition });
        }
      } catch {
        // Fallback default
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-end justify-center bg-[var(--bg-color)] px-2.5 py-1.5 rounded-2xl border border-[var(--card-border)] shadow-2xs select-none shrink-0">
      <span className="text-xs font-black text-[var(--text-primary)] tracking-tight font-sans">
        {weather.temp}°C
      </span>
      <span className="text-[10px] font-medium text-[var(--text-muted)] font-sans whitespace-nowrap">
        {weather.condition}
      </span>
    </div>
  );
};
