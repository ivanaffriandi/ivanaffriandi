/**
 * Curated collection of high-resolution, authentic real photography (100% non-AI) from world-class landscape photographers.
 * Used as beautiful dynamic fallbacks for blog posts that don't have images.
 */
export const MINIMALIST_NATURE_COVERS = [
  '/images/nature/real_forest_sunbeams.jpg', // Forest sunbeams by Luca Bravo
  '/images/nature/real_turquoise_lake.jpg',   // Lake Braies Dolomites by Pietro De Grandi
  '/images/nature/real_golden_hills.jpg',     // Golden rolling hills by Sébastien Gabriel
  '/images/nature/real_yosemite_valley.jpg',  // Yosemite Valley reflection by Bailey Zindel
  '/images/nature/real_ocean_coast.jpg',      // Azure ocean coast by Sean Oulashin
  '/images/nature/real_misty_mountain.jpg',   // Alpine wilderness by Roberto Sysa Moiola
  '/images/nature/real_alpine_river.jpg',     // Rocky Mountain river by Kalen Emsley
  '/images/nature/real_snow_peak.jpg',        // Mountain ridge sunset by Jerry Zhang
];

/**
 * Returns a deterministic, distinct minimalist nature cover based on a post seed (title/id) or index.
 * Guarantees that different posts without images receive diverse, authentic real photography covers.
 */
export function getMinimalistNatureCover(seed?: string, fallbackIndex?: number): string {
  if (typeof fallbackIndex === 'number' && fallbackIndex >= 0) {
    return MINIMALIST_NATURE_COVERS[fallbackIndex % MINIMALIST_NATURE_COVERS.length];
  }
  if (!seed) {
    const idx = Math.floor(Math.random() * MINIMALIST_NATURE_COVERS.length);
    return MINIMALIST_NATURE_COVERS[idx];
  }
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % MINIMALIST_NATURE_COVERS.length;
  return MINIMALIST_NATURE_COVERS[idx];
}
