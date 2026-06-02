import React, { useState } from 'react';
import { FiSearch, FiMapPin } from 'react-icons/fi';

const SearchBar = ({ onSearch, onGeolocate, loading, geoLoading }) => {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const city = value.trim();
    if (city) onSearch(city);
  };

  return (
    <form className="searchbar" onSubmit={submit} role="search">
      <div className="searchbar__field">
        <FiSearch className="searchbar__icon" aria-hidden="true" />
        <input
          type="text"
          name="location"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search any city…"
          aria-label="City name"
          autoComplete="off"
          spellCheck="false"
        />
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
