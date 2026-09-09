"use client";

import { useState } from "react";

export default function Header() {
  const [location, setLocation] = useState("Lucknow");

  const changeLocation = () => {
    const newLocation = window.prompt(
      "Enter your city",
      location
    );

    if (newLocation && newLocation.trim()) {
      setLocation(newLocation.trim());
    }
  };

  return (
    <header className="lp-header">
      <div className="lp-header-left">
        <div className="lp-logo">
          Local<span>Platform</span>
        </div>

        <button
          type="button"
          className="lp-location"
          onClick={changeLocation}
        >
          <span className="location-pin">⌖</span>
          <span>{location}</span>
          <span className="location-arrow">⌄</span>
        </button>
      </div>

      <div className="lp-header-actions">
        <button
          type="button"
          className="lp-header-icon"
          aria-label="Notifications"
        >
          ♧
          <span className="notification-badge">3</span>
        </button>

        <button
          type="button"
          className="lp-header-icon"
          aria-label="Messages"
        >
          ◌
          <span className="notification-badge message-badge">
            S
          </span>
        </button>
      </div>
    </header>
  );
}