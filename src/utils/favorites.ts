const FAVORITES_KEY = 'toyama-permit-watcher:favorites:v1';

export function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    console.error('localStorage is not available or corrupted');
    return [];
  }
}

export function toggleFavorite(id: string): void {
  const favorites = getFavorites();
  const index = favorites.indexOf(id);
  if (index === -1) {
    favorites.push(id);
  } else {
    favorites.splice(index, 1);
  }
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    console.error('Failed to save favorites to localStorage');
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}
