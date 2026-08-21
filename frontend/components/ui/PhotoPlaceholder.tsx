import { cn } from "@/lib/cn";

type PhotoPlaceholderProps = {
  label?: string;
  tone?: "warm" | "forest" | "memorial";
  /**
   * "pattern" — quiet woven texture, used inside cards/grids where the
   * placeholder is one of many.
   * "scene" — a soft, photographic landscape abstraction (sky wash,
   * hill silhouettes, warm glow) for large hero/feature slots, where a
   * flat texture would read as an obvious placeholder rather than "a
   * photo is about to go here".
   */
  variant?: "pattern" | "scene";
  className?: string;
};

const toneStyles: Record<NonNullable<PhotoPlaceholderProps["tone"]>, string> = {
  warm: "from-clay-light via-cream-deep to-gold-light",
  forest: "from-moss-light via-cream-deep to-stone-light",
  memorial: "from-memorial-surface via-memorial-bg to-memorial-line",
};

const sceneHillStyles: Record<NonNullable<PhotoPlaceholderProps["tone"]>, string[]> = {
  warm: ["#c99a3e", "#b15e3b", "#6b6152"],
  forest: ["#8fa37a", "#6e8f73", "#2f4a3b"],
  memorial: ["#b9c2ba", "#8f978f", "#5f665f"],
};

/**
 * Stand-in for a real Musaküçə photograph — never generic stock imagery.
 * `pattern` renders a faint woven texture (for cards/grids); `scene`
 * renders a warm, photographic landscape abstraction sized for hero /
 * full-bleed slots, so the empty space reads as "a village photo belongs
 * here" rather than as a visibly unfinished placeholder.
 */
export function PhotoPlaceholder({
  label = "Fotoqrafiya üçün yer",
  tone = "warm",
  variant = "pattern",
  className,
}: PhotoPlaceholderProps) {
  if (variant === "scene") {
    const [near, mid, far] = sceneHillStyles[tone];
    return (
      <div
        className={cn(
          "relative flex h-full w-full items-end overflow-hidden",
          className,
        )}
      >
        <svg
          aria-hidden
          viewBox="0 0 100 60"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="pp-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8f2e6" />
              <stop offset="55%" stopColor="#f1ddc4" />
              <stop offset="100%" stopColor="#e3ead9" />
            </linearGradient>
            <radialGradient id="pp-glow" cx="50%" cy="38%" r="45%">
              <stop offset="0%" stopColor="#f4e6bf" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#f4e6bf" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100" height="60" fill="url(#pp-sky)" />
          <rect width="100" height="60" fill="url(#pp-glow)" />
          <path d="M0 40 Q 20 30 38 36 T 70 32 T 100 38 V60 H0 Z" fill={far} opacity="0.35" />
          <path d="M0 48 Q 25 36 55 44 T 100 40 V60 H0 Z" fill={mid} opacity="0.5" />
          <path d="M0 55 Q 30 46 60 52 T 100 48 V60 H0 Z" fill={near} opacity="0.6" />
        </svg>

        {/* Very faint grain so the surface reads as photographic, not flat vector art. */}
        <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.08] text-ink">
          <pattern id="pp-grain" width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#pp-grain)" />
        </svg>

        {label ? (
          <span className="relative m-4 rounded-full bg-ink/55 px-3 py-1 text-[11px] font-medium text-cream/90">
            {label}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br",
        toneStyles[tone],
        className,
      )}
    >
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-[0.18] text-ink"
      >
        <pattern
          id="weave"
          width="18"
          height="18"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(20)"
        >
          <path d="M0 9H18" stroke="currentColor" strokeWidth="1" />
          <path d="M9 0V18" stroke="currentColor" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#weave)" />
      </svg>
      {label ? (
        <span className="relative rounded-full bg-paper/90 px-3 py-1 text-xs font-medium text-ink-soft">
          {label}
        </span>
      ) : null}
    </div>
  );
}
