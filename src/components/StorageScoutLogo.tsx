export function StorageScoutLogo({ className = "", size = 200 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circular glow effect */}
      <circle cx="100" cy="100" r="95" fill="url(#glow)" opacity="0.15" />

      {/* Battery outline with energy flow */}
      <g>
        {/* Battery body */}
        <rect
          x="55"
          y="75"
          width="90"
          height="60"
          rx="8"
          stroke="url(#gradient1)"
          strokeWidth="3"
          fill="none"
        />

        {/* Battery terminal */}
        <rect
          x="145"
          y="92"
          width="8"
          height="26"
          rx="2"
          fill="url(#gradient1)"
        />

        {/* Energy charge levels - 3 bars */}
        <rect x="65" y="85" width="18" height="40" rx="3" fill="url(#gradient2)" opacity="0.8" />
        <rect x="90" y="85" width="18" height="40" rx="3" fill="url(#gradient2)" opacity="0.9" />
        <rect x="115" y="85" width="18" height="40" rx="3" fill="url(#gradient1)" />
      </g>

      {/* Circuit/connection nodes */}
      <g opacity="0.7">
        <circle cx="45" cy="100" r="4" fill="#34d399" />
        <circle cx="30" cy="85" r="3" fill="#34d399" />
        <circle cx="30" cy="115" r="3" fill="#34d399" />

        {/* Connection lines */}
        <line x1="30" y1="85" x2="45" y2="100" stroke="#34d399" strokeWidth="1.5" opacity="0.5" />
        <line x1="30" y1="115" x2="45" y2="100" stroke="#34d399" strokeWidth="1.5" opacity="0.5" />
        <line x1="45" y1="100" x2="55" y2="100" stroke="#34d399" strokeWidth="2" />
      </g>

      {/* Emission reduction waves/signals */}
      <g opacity="0.6">
        <path d="M 160 70 Q 165 65 170 60" stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 163 75 Q 170 70 177 65" stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 160 140 Q 165 145 170 150" stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 163 135 Q 170 140 177 145" stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* Center energy pulse icon */}
      <g transform="translate(100, 100)">
        <path
          d="M -8 -15 L 2 0 L -4 0 L 6 15 L -2 3 L 4 3 Z"
          fill="#34d399"
          opacity="0.9"
        />
      </g>

      {/* Orbital ring */}
      <circle
        cx="100"
        cy="100"
        r="78"
        stroke="url(#gradient3)"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4 8"
        opacity="0.4"
      />

      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.6" />
        </linearGradient>

        <radialGradient id="gradient3">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#34d399" />
        </radialGradient>

        <radialGradient id="glow">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
