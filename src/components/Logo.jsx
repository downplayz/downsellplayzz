import React from "react";

export default function Logo({ size = 48, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      style={{ filter: "drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.3))" }}
      id="custom-site-logo-svg"
    >
      {/* Circle Background with bevel gradient and border */}
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="#759c8d"
        stroke="#000000"
        strokeWidth="3.5"
      />
      
      {/* 3D Bevel/Highlight effect on the circle (inner top-left white glow, bottom-right dark glow) */}
      <circle
        cx="50"
        cy="50"
        r="42.2"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeDasharray="100 200"
        strokeDashoffset="120"
        opacity="0.15"
      />
      <circle
        cx="50"
        cy="50"
        r="42.2"
        fill="none"
        stroke="black"
        strokeWidth="1.5"
        strokeDasharray="100 200"
        strokeDashoffset="310"
        opacity="0.15"
      />

      {/* Stylized "K" Path with fill="none" to prevent black blobs */}
      <path
        d="M 36 26 L 36 74 M 30 50 L 44 50 M 44 26 L 44 65 Q 44 74 50 74"
        fill="none"
        stroke="#000000"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Stylized "G" Path with fill="none" to prevent black blobs */}
      <path
        d="M 70 42 L 70 32 Q 70 26 62.5 26 Q 55 26 55 33 L 55 67 Q 55 74 62.5 74 Q 70 74 70 58 L 62 58"
        fill="none"
        stroke="#000000"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

