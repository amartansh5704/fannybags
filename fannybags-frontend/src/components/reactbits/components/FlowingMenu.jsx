// src/components/reactbits/FlowingMenu.jsx
import React, { useRef, useState } from "react";
import "./FlowingMenu.css";

export default function FlowingMenu({ items = [], fullScreen = false }) {
  return (
    <div className={`menu-wrap ${fullScreen ? "menu-fullscreen" : ""}`}>
      <nav className="menu">
        {items.map((item, idx) => (
          <MenuItem key={idx} text={item.text} detail={item.detail} />
        ))}
      </nav>
    </div>
  );
}

function MenuItem({ text, detail }) {
  const marqueeInnerRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const togglePause = () => {
    setPaused((prev) => !prev);

    if (!paused) {
      marqueeInnerRef.current.classList.add("is-paused");
    } else {
      marqueeInnerRef.current.classList.remove("is-paused");
    }
  };

  const repeatedText = Array.from({ length: 8 }).map((_, idx) => (
    <span key={idx}>{detail}</span>
  ));

  return (
    <div className="menu__item" onClick={togglePause}>
      {/* Default big word */}
      <div className="menu__item-link modern-text">{text}</div>

      {/* Flow → appears on hover */}
      <div className="marquee glass-bg">
        <div className="marquee__inner-wrap">
          <div className="marquee__inner" ref={marqueeInnerRef} aria-hidden="true">
            {repeatedText}
          </div>
        </div>
      </div>
    </div>
  );
}
