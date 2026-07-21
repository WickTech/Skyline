import React, { useEffect, useRef, useState } from 'react';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import { geocodeCity } from '../api/geocoding';

const SearchBar = ({ onSearch, onSelectPlace, onGeolocate, loading, geoLoading }) => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // Debounced OpenWeather geocoding autocomplete. Best-effort — a failed lookup
  // just leaves the free-text submit path intact.
  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return undefined;
    }
    const timer = setTimeout(() => {
      geocodeCity(q, 5)
        .then((places) => {
          setSuggestions(places);
          setOpen(places.length > 0);
        })
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  // Close the dropdown on outside click.
  useEffect(() => {
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const city = value.trim();
    if (city) {
      setOpen(false);
      onSearch(city);
    }
  };

  const pick = (place) => {
    setValue(place.label);
    setSuggestions([]);
    setOpen(false);
    onSelectPlace(place);
  };

  return (
    <form className="searchbar" onSubmit={submit} role="search">
      <div className="searchbar__field" ref={boxRef}>
        <FiSearch className="searchbar__icon" aria-hidden="true" />
        <input
          type="text"
          name="location"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(suggestions.length > 0)}
          placeholder="Search any city…"
          aria-label="City name"
          autoComplete="off"
          spellCheck="false"
        />
        {open && suggestions.length > 0 && (
          <ul className="searchbar__suggestions" role="listbox">
            {suggestions.map((place) => (
              <li key={`${place.lat},${place.lon}`}>
                <button type="button" className="suggestion" onClick={() => pick(place)}>
                  <FiMapPin className="suggestion__icon" aria-hidden="true" />
                  {place.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="submit" className="btn btn--primary" disabled={loading || !value.trim()}>
        {loading ? 'Searching…' : 'Search'}
      </button>

      <button
        type="button"
        className="btn btn--ghost"
        onClick={onGeolocate}
        disabled={geoLoading}
        aria-label="Use my location"
        title="Use my location"
      >
        <FiMapPin aria-hidden="true" />
        <span className="btn__label">{geoLoading ? 'Locating…' : 'My location'}</span>
      </button>
    </form>
  );
};

export default SearchBar;
