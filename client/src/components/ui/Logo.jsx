/**
 * EventSphere brand mark.
 *
 * Concept: a small "sphere" (the platform, the center of campus life) with
 * two tilted orbit rings carrying event "nodes" - a direct, literal read of
 * the name that's also just a nice bit of geometry. Reused at larger scale
 * as the hero's signature element (see HeroOrbit.jsx) so the brand mark and
 * the hero graphic are visibly the same idea, not two unrelated pieces of
 * decoration.
 */
export function LogoMark({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="es-core" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8781ff" />
          <stop offset="55%" stopColor="#6d5df5" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      {/* Orbit rings */}
      <ellipse cx="20" cy="20" rx="17.5" ry="8" transform="rotate(-24 20 20)" stroke="#6d5df5" strokeOpacity="0.4" strokeWidth="1.4" />
      <ellipse cx="20" cy="20" rx="17.5" ry="8" transform="rotate(38 20 20)" stroke="#a855f7" strokeOpacity="0.3" strokeWidth="1.4" />

      {/* Core sphere */}
      <circle cx="20" cy="20" r="8.5" fill="url(#es-core)" />
      <circle cx="17.2" cy="17" r="2.4" fill="white" fillOpacity="0.35" />

      {/* Event nodes riding the orbits */}
      <circle cx="35.5" cy="14.3" r="2.1" fill="#FBBF24" />
      <circle cx="5.4" cy="27.6" r="1.8" fill="#6d5df5" />
    </svg>
  );
}

export default function Logo({ iconSize = 36, className = '', wordmarkClassName = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={iconSize} />
      <span className={`font-extrabold tracking-tight ${wordmarkClassName}`}>
        <span className="bg-gradient-to-r from-brand-700 to-accent-600 dark:from-brand-300 dark:to-accent-400 bg-clip-text text-transparent">
          Event
        </span>
        <span className="bg-gradient-to-r from-accent-600 to-brand-700 dark:from-accent-400 dark:to-brand-300 bg-clip-text text-transparent">
          Sphere
        </span>
      </span>
    </span>
  );
}
