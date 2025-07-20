import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LocationIcon, SearchIcon } from "./Icons";
import debounce from 'lodash.debounce';

const SearchBar = ({ handleSearch, isLoading, useMyLocation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=367e7d42316e1d44becc2dab706cbfaa`
        );

        const data = await response.json();

        const cities = Array.isArray(data)
          ? data.map(city => ({
              name: city.name,
              country: city.country,
            }))
          : [];

        setSuggestions(cities);
        setShowSuggestions(cities.length > 0);
      } catch (error) {
        console.error('Geocoding error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      fetchSuggestions.cancel(); // Cleanup on unmount
    };
  }, [fetchSuggestions]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchSuggestions(value);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (city) => {
    const cityName = `${city.name}, ${city.country}`;
    handleSearch(null, cityName);
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const onSearch = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchTerm.trim();

    if (!trimmed) return;

    const matchedCity = suggestions.find(
      (city) => city.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (matchedCity) {
      const cityName = `${matchedCity.name}, ${matchedCity.country}`;
      handleSearch(e, cityName);
      setSearchTerm('');
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      alert("Please select a valid city from the dropdown suggestions.");
    }
  };

  return (
    <div className="w-full max-w-6xl mb-6 px-4 relative">
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <LocationIcon />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearch(e);
          }}
          placeholder="Search for a city..."
          className="w-full pl-12 pr-20 py-4 text-gray-900 placeholder-gray-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Search Button */}
        <button
          onClick={onSearch}
          disabled={isLoading}
          className="absolute inset-y-0 right-0 pr-12 flex items-center text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          ) : (
            <SearchIcon />
          )}
        </button>

        {/* Use My Location Button */}
        <button
          onClick={useMyLocation}
          disabled={isLoading}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
          title="Use My Location"
        >
          <LocationIcon />
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 bg-white mt-1 w-full max-h-48 overflow-y-auto border border-gray-200 rounded-lg shadow-lg">
          {suggestions.map((city, index) => (
            <li
              key={index}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              onClick={() => handleSuggestionClick(city)}
            >
              <div className="flex items-center gap-2">
                <LocationIcon />
                <span className="font-medium">{city.name}</span>
                <span className="text-gray-500">, {city.country}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;