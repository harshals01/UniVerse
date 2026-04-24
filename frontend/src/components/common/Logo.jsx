import React from 'react';

export default function Logo({ size = 40, className = '', style = {} }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="10" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={{ transform: 'rotate(45deg)', ...style }}
    >
      {/* Top-Left: U */}
      <path d="M 25 15 L 25 35 A 10 10 0 0 0 45 35 L 45 15" />
      {/* Top-Right: < */}
      <path d="M 55 15 L 70 30 L 55 45" />
      {/* Bottom-Right: n */}
      <path d="M 55 85 L 55 65 A 10 10 0 0 1 75 65 L 75 85" />
      {/* Bottom-Left: > */}
      <path d="M 45 55 L 30 70 L 45 85" />
    </svg>
  );
}
