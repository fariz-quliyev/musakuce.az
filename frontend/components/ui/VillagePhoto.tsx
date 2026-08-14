import Image from "next/image";
import { cn } from "@/lib/cn";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

type VillagePhotoProps = {
  /** Path under /public (e.g. "/images/village/hero-demo.jpg"). Omit to
   * fall back to `PhotoPlaceholder` — used for slots with no verified
   * or sourced photo yet. */
  src?: string;
  alt: string;
  className?: string;
  tone?: "warm" | "forest" | "memorial";
  variant?: "pattern" | "scene";
  placeholderLabel?: string;
  priority?: boolean;
  sizes?: string;
  /** Extends the underlying `next/image`'s own className — mainly for
   * an `object-[position]`/responsive-`object-position` override on
   * crop-sensitive slots (e.g. the hero) where the default centered
   * `object-cover` cuts off the photo's real focal point. Merged after
   * the base `object-cover`, so a supplied `object-[...]` wins. */
  imageClassName?: string;
};

/**
 * Drop-in replacement for `PhotoPlaceholder` at any image slot: renders
 * the real photo via `next/image` (automatic WebP/AVIF + responsive
 * sizing) when `src` is given, otherwise renders `PhotoPlaceholder`
 * unchanged. This keeps every section's layout/aspect-ratio/box
 * identical regardless of whether a real photo exists yet for that slot.
 */
export function VillagePhoto({
  src,
  alt,
  className,
  tone = "warm",
  variant = "pattern",
  placeholderLabel,
  priority,
  sizes = "100vw",
  imageClassName,
}: VillagePhotoProps) {
  if (!src) {
    return (
      <PhotoPlaceholder
        tone={tone}
        variant={variant}
        label={placeholderLabel}
        className={className}
      />
    );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}
