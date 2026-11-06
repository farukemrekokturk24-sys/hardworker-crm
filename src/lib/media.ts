/**
 * Proje tanıtım videoları.
 *
 * Dosyalar public/video/<slug>.mp4 (+ .jpg poster) olarak durur; yeni bir
 * proje eklendiğinde videoyu aynı adla koymak yeterlidir.
 */

const SLUGS_WITH_VIDEO = new Set([
  "luxera-salamis",
  "sunrise-platinium",
  "sunrise-diamond",
  "sunrise-gold",
]);

export type ProjectVideo = { video: string; poster: string } | null;

export function projectVideo(slug: string): ProjectVideo {
  if (!SLUGS_WITH_VIDEO.has(slug)) return null;
  return { video: `/video/${slug}.mp4`, poster: `/video/${slug}.jpg` };
}

export const HERO_VIDEO = { video: "/video/hero.mp4", poster: "/video/hero.jpg" };
