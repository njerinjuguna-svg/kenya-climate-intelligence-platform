import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ counties, onCountySelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter counties as user types
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 0) {
      const filtered = counties.filter(county =>
        county.adm1_name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // When user clicks a suggestion
  const handleSelect = (county) => {
    setQuery(county.adm1_name);
    setShowSuggestions(false);
    setSuggestions([]);
    onCountySelect(county);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search county..."
          value={query}
          onChange={handleChange}
          onFocus={() => query && setShowSuggestions(true)}
        />
        {query && (
          <button className="clear-btn" onClick={handleClear}>✕</button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map(county => (
            <div
              key={county.ogc_fid}
              className="suggestion-item"
              onClick={() => handleSelect(county)}
            >
              <span className="suggestion-name">{county.adm1_name}</span>
              <span className="suggestion-code">{county.adm1_pcode}</span>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && (
        <div className="suggestions">
          <div className="no-results">No county found</div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;