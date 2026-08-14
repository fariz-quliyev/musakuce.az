import type { VideoEmbedProvider } from "@/lib/api/types";

const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".ogg", ".aac"];

export function extractYouTubeId(value: string): string {
  const match = value.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return match ? match[1] : value;
}

export function extractVimeoId(value: string): string {
  const match = value.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : value;
}

/**
 * No embed-rendering convention existed yet anywhere in the codebase
 * (the public /videolar listing doesn't play videos inline) — this is a
 * minimal player covering the three existing VideoEmbedProvider values.
 * SelfHosted picks <audio> vs <video> from the file extension since
 * Interview doesn't otherwise distinguish audio-only recordings.
 */
export function InterviewEmbed({ provider, urlOrKey }: { provider: VideoEmbedProvider; urlOrKey: string }) {
  if (provider === "YouTube") {
    return (
      <div className="aspect-video overflow-hidden rounded-xl bg-ink shadow-md">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(urlOrKey)}`}
          title="Müsahibə videosu"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (provider === "Vimeo") {
    return (
      <div className="aspect-video overflow-hidden rounded-xl bg-ink shadow-md">
        <iframe
          src={`https://player.vimeo.com/video/${extractVimeoId(urlOrKey)}`}
          title="Müsahibə videosu"
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const isAudio = AUDIO_EXTENSIONS.some((ext) => urlOrKey.toLowerCase().endsWith(ext));
  if (isAudio) {
    return (
      <div className="rounded-xl border border-stone-light bg-paper-soft p-5">
        <audio controls src={urlOrKey} className="w-full">
          Səs faylı brauzerinizdə dəstəklənmir.
        </audio>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-ink shadow-md">
      <video controls src={urlOrKey} className="aspect-video w-full">
        Video brauzerinizdə dəstəklənmir.
      </video>
    </div>
  );
}
