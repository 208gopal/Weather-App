import React, { useEffect, useState } from 'react';
import { WindIcon, DropIcon } from "./Components/Icons.jsx";
import { DayForecast, HourForecast } from "./Components/DayHourBars.jsx";
import SearchBar from './Components/SearchBar.jsx';

const App = () => {
  const [weather, setWeather] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [currentCity, setCurrentCity] = useState('Multan');
  const [isLoading, setIsLoading] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const reverseRes = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=367e7d42316e1d44becc2dab706cbfaa`
          );

          const data = await reverseRes.json();
          if (!data.length) throw new Error("No reverse geo data");

          const state = data[0].state;
          const country = data[0].country;
          const queryName = `${state}, ${country}`;  // ✅ Use state instead of city

          setSelectedDayIndex(0);
          fetchWeather(queryName);
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          alert("Unable to detect your state.");
        }
      },
      (error) => {
        alert("Location access denied.");
        console.error("Geolocation error:", error);
      }
    );
  };

  const fetchWeather = async (input) => {
    try {
      setIsLoading(true);

      let lat, lon, name, country;

      // 🟨 Case 1: String input — it's a city name
      if (typeof input === 'string') {
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=1&appid=367e7d42316e1d44becc2dab706cbfaa`);
        const geoData = await geoRes.json();
        if (!geoData.length) throw new Error('Invalid city');

        ({ lat, lon, name, country } = geoData[0]);
      }

      // 🟩 Case 2: Object input — it's coordinates from geolocation
      else if (typeof input === 'object' && input.lat && input.lon) {
        lat = input.lat;
        lon = input.lon;

        // Use reverse geocoding to get the city name
        const reverseGeoRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=367e7d42316e1d44becc2dab706cbfaa`);
        const reverseGeoData = await reverseGeoRes.json();
        if (!reverseGeoData.length) throw new Error('Reverse geocoding failed');

        ({ name, country } = reverseGeoData[0]);
      } else {
        throw new Error('Invalid input to fetchWeather');
      }

      // 🟦 Fetch current weather
      const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=367e7d42316e1d44becc2dab706cbfaa&units=metric`);
      const currentData = await currentRes.json();

      // 🟨 Fetch forecast
      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=367e7d42316e1d44becc2dab706cbfaa&units=metric`);
      const forecastData = await forecastRes.json();

      // 🟧 Store final combined data
      const realData = {
        current: currentData,
        forecast: forecastData
      };

      setWeather(realData);
      setCurrentCity(`${name}, ${country}`); // Clean display name
    } catch (err) {
      console.error('Failed to fetch weather:', err.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(currentCity);
  }, [currentCity]);

  const handleSearch = (e, cityName) => {
    if (e) e.preventDefault();
    if (!cityName) return;
    setCurrentCity(cityName);
    fetchWeather(cityName);
    setSelectedDayIndex(0);
  };

  const handleDayClick = (dayIndex) => {
    setSelectedDayIndex(dayIndex);
  };

  if (!weather) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#EAEAEA]">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              {/* Sun rays */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-1 h-8 bg-yellow-400 rounded-full"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-20px)`,
                      opacity: 0.7,
                      animation: `pulse 1.5s ease-in-out infinite ${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
              {/* Sun core */}
              <div className="absolute inset-0 m-auto w-16 h-16 bg-yellow-400 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-medium text-gray-600 mb-2">Loading Weather Data</div>
          <div className="text-gray-500">Fetching forecast for {currentCity}...</div>
        </div>
        
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.7; transform: rotate(var(--rot)) translateY(-20px); }
            50% { opacity: 0.3; transform: rotate(var(--rot)) translateY(-25px); }
          }
        `}</style>
      </div>
    );
  }

  const date = new Date();

  const dailyForecast = [...Array(6)].map((_, i) => {
    const d = new Date();
    d.setDate(date.getDate() + i);
    const targetDate = d.toISOString().split('T')[0];

    const dayEntries = weather.forecast.list.filter(entry =>
      entry.dt_txt.startsWith(targetDate)
    );

    const bestMatch =
      dayEntries.find(e => e.dt_txt.includes('12:00:00')) ||
      dayEntries[Math.floor(dayEntries.length / 2)];

    const isToday = i === 0;

    return {
      day: isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      temp: isToday && weather.current?.main?.temp !== undefined 
        ? Math.round(weather.current.main.temp)
        : (bestMatch ? Math.round(bestMatch.main.temp) : 'N/A'),
      condition: isToday && weather.current?.weather?.[0]?.main
        ? weather.current.weather[0].main
        : (bestMatch ? bestMatch.weather[0].main : 'N/A'),
      isToday,
      fullData: bestMatch,
      date: d,
      dayEntries: dayEntries
    };
  });

  const selectedDay = dailyForecast[selectedDayIndex];
  const selectedDate = selectedDay?.date || date;

  const displayTemp = selectedDayIndex === 0 
    ? (weather.current?.main?.temp !== undefined ? Math.round(weather.current.main.temp) : 'N/A')
    : selectedDay?.temp || 'N/A';
    
  const displayFeelsLike = selectedDayIndex === 0
    ? (weather.current?.main?.feels_like !== undefined ? Math.round(weather.current.main.feels_like) : 'N/A')
    : (selectedDay?.fullData ? Math.round(selectedDay.fullData.main.feels_like) : 'N/A');
    
  const displayWindSpeed = selectedDayIndex === 0
    ? (weather.current?.wind?.speed !== undefined ? weather.current.wind.speed.toFixed(2) : 'N/A')
    : (selectedDay?.fullData ? selectedDay.fullData.wind.speed.toFixed(2) : 'N/A');
    
  const displayHumidity = selectedDayIndex === 0
    ? (weather.current?.main?.humidity !== undefined ? Number(weather.current.main.humidity.toFixed(2)) : 'N/A')
    : (selectedDay?.fullData ? Number(selectedDay.fullData.main.humidity.toFixed(2)) : 'N/A');
    
  const displayCondition = selectedDayIndex === 0
    ? (weather.current?.weather?.[0]?.main || 'Clear')
    : (selectedDay?.condition || 'Clear');

  const hourlyForecast = selectedDay?.dayEntries?.length > 0 
    ? selectedDay.dayEntries.slice(0, 6).map(entry => ({
        time: new Date(entry.dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        temp: Math.round(entry.main.temp),
        condition: entry.weather[0].main,
      }))
    : weather.forecast.list.slice(1, 7).map(entry => ({
        time: new Date(entry.dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        temp: Math.round(entry.main.temp),
        condition: entry.weather[0].main,
      }));

  return (
  <div className="h-full w-full items-center justify-center bg-[#EAEAEA]">
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100">
      
      {/* Top Search Bar */}
      <SearchBar 
        handleSearch={handleSearch}
        isLoading={isLoading}
        useMyLocation={useMyLocation}
      />

      {/* Main Content: Left and Right sections */}
      <div className="bg-white rounded-3xl shadow-md w-full max-w-6xl flex flex-col mb-8 lg:mb-0 lg:flex-row">
        
        {/* Main Weather Section (Left) */}
        <div className="w-full lg:w-2/3 lg:pr-6 p-4 lg:p-8 relative">
          <div className="absolute top-0 right-0 h-full w-6 bg-white/40 blur-md pointer-events-none z-10"></div>

          <div className="relative z-20">
            <div className="flex justify-between items-start mb-2">
              <div className="text-base md:text-lg font-semibold text-gray-600 tracking-wide">{currentCity}</div>
              <div className="text-base md:text-lg font-semibold text-gray-600 tracking-wide">
                {`${selectedDate.getDate().toString().padStart(2, '0')}.${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}.${selectedDate.getFullYear()}`}
              </div>
            </div>

            <div className="text-[16vh] md:text-[18vh] lg:text-[20vh] font-semibold text-center text-[#696969] mt-4">{displayTemp}&deg;</div>
            <div className="text-3xl md:text-4xl lg:text-5xl text-center text-[#696969] mb-6">{displayCondition}</div>

            <div className="flex justify-center gap-8 md:gap-12 mb-8">
              <div className="text-xs md:text-sm flex items-center gap-1 text-[#696969]">
                <WindIcon /> <span>{displayWindSpeed} mph</span>
              </div>
              <div className="text-xs md:text-sm flex items-center gap-1 text-[#696969]">
                <DropIcon /> <span>{displayHumidity}%</span>
              </div>
            </div>

            <div className="flex justify-center items-center overflow-x-auto gap-2 w-full">
              {dailyForecast.map((day, idx) => (
                <DayForecast 
                  key={idx} 
                  {...day} 
                  isSelected={selectedDayIndex === idx}
                  onClick={handleDayClick}
                  dayIndex={idx}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="w-full lg:w-1/3 lg:pl-6 pt-4 flex flex-col justify-between bg-[#F6F6F6] p-4 lg:p-8 items-center text-center">
          <div>
            <div className="text-2xl md:text-3xl font-normal py-4 text-gray-700">Good Morning</div>
            <div className="text-2xl md:text-3xl mt-1 font-normal text-gray-700">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#696969]">{displayTemp}&deg;</div>
              <div className="flex flex-col gap-2 text-xs md:text-sm text-[#696969]">
                <div className="flex items-center gap-1">
                  <WindIcon />
                  <span>{displayWindSpeed} mph</span>
                </div>
                <div className="flex items-center gap-1">
                  <DropIcon />
                  <span>{displayHumidity}%</span>
                </div>
              </div>
            </div>
            <div className="text-xs md:text-sm text-gray-600">Feels like {displayFeelsLike}&deg;</div>
            <div className="text-sm md:text-md text-[#696969]">{displayCondition}</div>
          </div>

          <div className="mt-8 w-full">
            <div className="text-base md:text-lg font-semibold mb-4 text-center">Hourly Forecast</div>
            <div className='flex items-center justify-center'>
              <div className="lg:grid lg:grid-cols-3 gap-2 sm:flex grid grid-cols-3 justify-center">
                {hourlyForecast.map((hour, idx) => (
                  <HourForecast key={idx} {...hour} />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
);
};

export default App;