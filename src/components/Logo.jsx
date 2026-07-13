import React from "react";

export default function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
      id="kira-game-logo-svg"
    >
      <defs>
        {/* Subtle drop shadow for the 3D button look */}
        <filter id="badgeShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="1.2" dy="2.2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
        </filter>
        
        {/* Subtle 3D gradient for the badge background */}
        <linearGradient id="badgeBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#81a699" />
          <stop offset="60%" stopColor="#719889" />
          <stop offset="100%" stopColor="#5d8173" />
        </linearGradient>
      </defs>

      {/* Shadow layer */}
      <circle cx="51.5" cy="51.5" r="41" fill="#000000" opacity="0.18" />

      {/* Main Circle Badge */}
      <circle
        cx="50"
        cy="50"
        r="41"
        fill="url(#badgeBg)"
        stroke="#000000"
        strokeWidth="2.2"
        id="logo-circle-badge"
      />

      {/* KG Letters */}
      <g stroke="#000000" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        {/* K Spine 1 */}
        <path d="M 41 35 L 41 65" />
        
        {/* K Crossbar / Tick */}
        <path d="M 38 53 L 48 53" />
        
        {/* K Spine 2 (with curved bottom leg) */}
        <path d="M 48 35 L 48 61 C 48 64, 50 65, 52 65" />
        
        {/* Stylized G */}
        <path d="M 60 41 L 60 39 C 60 35, 53 35, 53 39 L 53 61 C 53 65, 60 65, 60 61 L 60 52 L 56 52" />
      </g>
    </svg>
  );
}


