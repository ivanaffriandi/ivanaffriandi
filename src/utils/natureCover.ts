/**
 * Curated collection of high-resolution, authentic real photography (100% non-AI) of oceans and seascapes.
 * Used as beautiful dynamic fallbacks for blog posts that don't have images.
 */
export const MINIMALIST_NATURE_COVERS = [
  '/images/nature/ocean_sunset_amber_ripple.jpg', // Warm golden hour sunset ripples with natural amber bokeh
  '/images/nature/ocean_pastel_beach_mist.jpg',    // Soft pale cyan surf & wet sand under misty pastel sky
  '/images/nature/ocean_peach_horizon_sun.jpg',   // Serene terracotta-peach sunset horizon over calm slate sea
  '/images/nature/ocean_minimal_sand_dune.jpg',   // Clean minimalist cream sand beach meeting azure horizon
  '/images/nature/ocean_dusk_water_gradient.jpg', // Silky calm water gradient from deep oceanic blue to soft peach
  '/images/nature/ocean_zen_blue_gradient.jpg',   // Ethereal pure blue sky to deep sapphire ocean gradient
  '/images/nature/ocean_sage_mist_waves.jpg',     // Moody rolling waves in soft sage-slate green and coastal mist
  '/images/nature/ocean_turquoise_horizon.jpg',   // Crisp clean turquoise sea meeting white sky horizon
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
