/** Default cover gradients assigned deterministically based on user ID */
export const DEFAULT_COVER_GRADIENTS = [
  "from-blue-400 to-purple-600",
  "from-green-400 to-cyan-600",
  "from-orange-400 to-red-600",
  "from-pink-400 to-rose-600",
  "from-indigo-400 to-violet-600",
  "from-teal-400 to-emerald-600",
] as const;

/**
 * Returns a deterministic Tailwind gradient class for a given user ID.
 * Falls back to the first gradient when userId is undefined.
 */
export const getGradientForUser = (userId: string | undefined): string => {
  if (!userId) return DEFAULT_COVER_GRADIENTS[0];
  const hash = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DEFAULT_COVER_GRADIENTS[hash % DEFAULT_COVER_GRADIENTS.length];
};

/**
 * Injects `f_auto,q_auto` transformation parameters into a Cloudinary image URL
 * so the CDN can auto-select the optimal format and quality.
 * Returns `undefined` when no URL is provided.
 */
export const getOptimizedCoverUrl = (
  url: string | undefined
): string | undefined => {
  if (!url) return undefined;
  // Avoid unnecessary escape of "/" inside character class — use [^/] not [^\/]
  return url.replace(
    /https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//,
    (match) => match + "f_auto,q_auto/"
  );
};

/**
 * Formats a numeric count into a compact string (e.g. 48500 → "48.5k").
 * Values below 1 000 are returned as plain strings.
 */
export const formatCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};
