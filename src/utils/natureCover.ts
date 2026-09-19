/**
 * Curated collection of high-resolution, editorial minimalist nature photographs in vivid natural color.
 * Used as beautiful dynamic fallbacks for blog posts that don't have images.
 */
export const MINIMALIST_NATURE_COVERS = [
  '/images/nature/emerald_forest.jpg',   // Lush vibrant green moss & golden sunbeams
  '/images/nature/turquoise_lake.jpg',   // Crystal turquoise alpine lake & azure sky
  '/images/nature/golden_hills.jpg',     // Warm amber golden hour rolling hills
  '/images/nature/autumn_foliage.jpg',   // Vivid scarlet red & golden maple foliage
  '/images/nature/ocean_coast.jpg',      // Azure ocean waves & golden sand beach
  '/images/nature/lavender_field.jpg',   // Rich purple lavender & warm sunset glow
  '/images/nature/bamboo_forest.jpg',    // Fresh vibrant lime & emerald bamboo grove
  '/images/nature/alpenglow_peak.jpg',   // Majestic Alpine peak in pink-orange alpenglow
];

/**
 * Returns a deterministic, distinct minimalist nature cover based on a post seed (title/id) or index.
 * Guarantees that different posts without images receive diverse, colorful, high-definition nature covers.
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
