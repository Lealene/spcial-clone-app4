/**
 * Unsplash URL helper for design-exploration photography we don't own yet.
 * `id` is the photo id (the part after `photo-`). Replace these with owned
 * assets or Payload Media before launch.
 */
export function unsplash(id: string, width = 1100): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=72`;
}
