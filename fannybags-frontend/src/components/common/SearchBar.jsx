import React from "react";
import "./SearchBar.css"; // <-- NEW CSS FILE

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search campaigns...",
}) {
  return (
    <div className="input__container">
      <input
        type="text"
        className="input__search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />

      <button className="input__button__shadow">
        🔍
      </button>

      <div className="shadow__input"></div>
    </div>
  );
}
