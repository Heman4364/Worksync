import React, { useState, useEffect, useRef } from 'react';

export const InteractiveMascot = ({ isEmailFocused, isPasswordFocused, showPassword, role }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isPasswordFocused || isEmailFocused) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      // Clamp between -5px and 5px
      const clampedX = Math.max(-5, Math.min(5, deltaX * 5));
      const clampedY = Math.max(-4, Math.min(4, deltaY * 4));

      setMousePos({ x: clampedX, y: clampedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPasswordFocused, isEmailFocused]);

  // Determine eye pupil position
  let pupilX = mousePos.x;
  let pupilY = mousePos.y;

  if (isEmailFocused) {
    pupilX = 0;
    pupilY = 4; // Look down at input
  } else if (isPasswordFocused) {
    pupilX = 0;
    pupilY = -1;
  }

  // Determine paw positions (peek-a-boo)
  // Normal: translateY(60px) (hidden)
  // Password focused & hidden: translateY(0px) (both paws covering eyes)
  // Password focused & revealed: left paw covers eye, right paw peeks down
  const leftPawY = isPasswordFocused ? 0 : 55;
  const rightPawY = isPasswordFocused ? (showPassword ? 18 : 0) : 55;
  const rightPawRotate = isPasswordFocused && showPassword ? 15 : 0;

  return (
    <div ref={containerRef} className="relative w-36 h-28 mx-auto -mb-4 select-none pointer-events-none">
      <svg
        viewBox="0 0 140 110"
        className="w-full h-full overflow-visible transition-transform duration-300"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="pawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Ears */}
        <circle cx="36" cy="38" r="14" fill="#334155" />
        <circle cx="36" cy="38" r="8" fill="#475569" />
        <circle cx="104" cy="38" r="14" fill="#334155" />
        <circle cx="104" cy="38" r="8" fill="#475569" />

        {/* Head / Body Base */}
        <rect
          x="26"
          y="28"
          width="88"
          height="76"
          rx="38"
          fill="url(#bodyGrad)"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Role Accessory: Headset for EMPLOYEE */}
        {role === 'EMPLOYEE' && (
          <g className="transition-opacity duration-300">
            <path
              d="M 24 55 A 48 48 0 0 1 116 55"
              fill="none"
              stroke="#6366f1"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <rect x="18" y="48" width="10" height="20" rx="4" fill="#6366f1" />
            <rect x="112" y="48" width="10" height="20" rx="4" fill="#6366f1" />
            <path d="M 22 62 Q 26 80 44 80" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="45" cy="80" r="3" fill="#818cf8" />
          </g>
        )}

        {/* Eyes (Left & Right) */}
        {/* Left Eye */}
        <circle cx="50" cy="58" r="12" fill="#ffffff" />
        {/* Right Eye */}
        <circle cx="90" cy="58" r="12" fill="#ffffff" />

        {/* Pupils (Tracking Mouse / Inputs) */}
        <g style={{ transform: `translate(${pupilX}px, ${pupilY}px)`, transition: 'transform 0.15s ease-out' }}>
          {/* Left Pupil */}
          <circle cx="50" cy="58" r="6" fill="#0f172a" />
          <circle cx="52" cy="56" r="2" fill="#ffffff" />

          {/* Right Pupil */}
          <circle cx="90" cy="58" r="6" fill="#0f172a" />
          <circle cx="92" cy="56" r="2" fill="#ffffff" />
        </g>

        {/* Role Accessory: Glasses for MANAGER */}
        {role === 'MANAGER' && (
          <g className="transition-opacity duration-300">
            <rect x="36" y="48" width="28" height="20" rx="5" fill="none" stroke="#10b981" strokeWidth="2.5" />
            <rect x="76" y="48" width="28" height="20" rx="5" fill="none" stroke="#10b981" strokeWidth="2.5" />
            <line x1="64" y1="57" x2="76" y2="57" stroke="#10b981" strokeWidth="2.5" />
          </g>
        )}

        {/* Snout & Nose */}
        <ellipse cx="70" cy="72" rx="12" ry="8" fill="#0f172a" />
        <ellipse cx="70" cy="69" rx="5" ry="3.5" fill="#334155" />
        <path d="M 68 73 Q 70 76 72 73" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />

        {/* Cheeks subtle blush */}
        <circle cx="38" cy="68" r="5" fill="#f43f5e" opacity="0.25" />
        <circle cx="102" cy="68" r="5" fill="#f43f5e" opacity="0.25" />

        {/* Role Accessory: Golden Crown for ADMIN */}
        {role === 'ADMIN' && (
          <g className="transition-all duration-300 animate-float-gentle">
            <polygon
              points="52,24 58,12 70,22 82,12 88,24"
              fill="url(#crownGrad)"
              stroke="#b45309"
              strokeWidth="1.5"
            />
            <circle cx="58" cy="12" r="2" fill="#ef4444" />
            <circle cx="70" cy="22" r="2.5" fill="#3b82f6" />
            <circle cx="82" cy="12" r="2" fill="#10b981" />
          </g>
        )}

        {/* Interactive Paws / Hands covering eyes during password input */}
        {/* Left Paw */}
        <g
          style={{
            transform: `translateY(${leftPawY}px)`,
            transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <ellipse cx="48" cy="60" rx="14" ry="16" fill="url(#pawGrad)" stroke="#475569" strokeWidth="2" />
          {/* Paw pads */}
          <ellipse cx="48" cy="63" rx="5" ry="4" fill="#64748b" />
          <circle cx="43" cy="55" r="2" fill="#64748b" />
          <circle cx="48" cy="53" r="2" fill="#64748b" />
          <circle cx="53" cy="55" r="2" fill="#64748b" />
        </g>

        {/* Right Paw (Peeks if showPassword is true!) */}
        <g
          style={{
            transform: `translateY(${rightPawY}px) rotate(${rightPawRotate}deg)`,
            transformOrigin: '92px 60px',
            transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <ellipse cx="92" cy="60" rx="14" ry="16" fill="url(#pawGrad)" stroke="#475569" strokeWidth="2" />
          {/* Paw pads */}
          <ellipse cx="92" cy="63" rx="5" ry="4" fill="#64748b" />
          <circle cx="87" cy="55" r="2" fill="#64748b" />
          <circle cx="92" cy="53" r="2" fill="#64748b" />
          <circle cx="97" cy="55" r="2" fill="#64748b" />
        </g>
      </svg>
    </div>
  );
};

export default InteractiveMascot;
