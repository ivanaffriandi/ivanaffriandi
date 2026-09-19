/**
 * Curated collection of high-resolution, editorial minimalist nature photographs.
 * Used as beautiful dynamic fallbacks for blog posts that don't have images.
 */
export const MINIMALIST_NATURE_COVERS = [
  '/images/nature/misty_forest.jpg',
  '/images/nature/foggy_mountains.jpg',
  '/images/nature/calm_lake.jpg',
  '/images/nature/zen_hills.jpg',
  '/images/nature/pine_mist.png',
  '/images/nature/green_ridge.jpg',
  '/nature_hero.png',
];

/**
 * Returns a deterministic minimalist nature cover based on a post seed (title, id, or content)
 * or picks a random one if no seed is provided.
 */
export function getMinimalistNatureCover(seed?: string): string {
  if (!seed) {
    const idx = Math.floor(Math.random() * MINIMALIST_NATURE_COVERS.length);
    return MINIMALIST_NATURE_COVERS[idx];
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % MINIMALIST_NATURE_COVERS.length;
  return MINIMALIST_NATURE_COVERS[idx];
}
