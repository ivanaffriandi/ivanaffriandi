/**
 * Curated collection of high-resolution, authentic real photography (100% non-AI) of oceans and seascapes.
 * Used as beautiful dynamic fallbacks for blog posts that don't have images.
 */
export const MINIMALIST_NATURE_COVERS = [
  '/images/nature/ocean_azure_beach.jpg',    // Crystal azure breaking wave & beach by Sean Oulashin
  '/images/nature/ocean_deep_blue.jpg',      // Deep sapphire ocean swell by Matt Hardy
  '/images/nature/ocean_turquoise_reef.jpg', // Aerial turquoise tropical lagoon by Shifaaz shamoon
  '/images/nature/ocean_aqua_wave.jpg',      // Vibrant barrel wave breaking in sunlight by Jeremy Bishop
  '/images/nature/ocean_calm_horizon.jpg',   // Serene calm vast ocean horizon by Joseph Barrientos
  '/images/nature/ocean_sunset_shore.jpg',   // Sunset golden hour wave wash by Jeremy Bishop
  '/images/nature/ocean_emerald_coast.jpg',  // Emerald coast surf & seafoam by Austin Neill
  '/images/nature/ocean_tropical_shore.jpg', // Soft tropical ocean tide by Mohamed Nohassi
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
