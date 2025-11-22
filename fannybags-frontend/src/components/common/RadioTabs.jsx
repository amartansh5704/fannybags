import React from "react";
import "./radioTabs.css"; // ← your CSS file

export default function RadioTabs({ children }) {
  return (
    <div className="tabs-container">
      <div className="tabs bg-[#111] border border-gray-700">
        {React.Children.map(children, (child, index) => (
          <>
            <input
              type="radio"
              id={`radio-${index}`}
              name="nav-tabs"
              defaultChecked={index === 0}
            />
            <label className="tab" htmlFor={`radio-${index}`}>
              {child}
            </label>
          </>
        ))}

        {/* Auto-width based on number of items */}
        <span
          className="glider"
          style={{ width: `${100 / React.Children.count(children)}%` }}
        />
      </div>
    </div>
  );
}
