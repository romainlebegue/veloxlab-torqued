interface LogoProps {
  size?: number;
  showTagline?: boolean;
  className?: string;
}

export function Logo({ size = 32, showTagline = false, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-ink shrink-0"
      >
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
        <circle cx="24" cy="24" r="8" fill="#E8412A" />
        <line x1="24" y1="4" x2="24" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="36" x2="24" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="4" y1="24" x2="12" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="9.4" y1="9.4" x2="15.3" y2="15.3" stroke="#E8412A" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="32.7" y1="32.7" x2="38.6" y2="38.6" stroke="#E8412A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <div className="flex flex-col leading-none">
        <span
          className="font-sans font-semibold text-ink tracking-tight"
          style={{ fontSize: size * 0.56, letterSpacing: "-0.03em" }}
        >
          TORQUED<span className="text-coral">.</span>
        </span>
        {showTagline && (
          <span
            className="font-mono text-ink-light uppercase tracking-widest"
            style={{ fontSize: size * 0.22, letterSpacing: "0.14em" }}
          >
            Pan-European Auto Parts
          </span>
        )}
      </div>
    </div>
  );
}
