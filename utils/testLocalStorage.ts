/**
 * Utility function to check what's being stored in localStorage
 * This is for debugging purposes only
 */
export function checkLocalStorage(key: string): void {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      console.log(`LocalStorage item "${key}":`, parsed);
      
      // Check if any items have imageUrl
      if (Array.isArray(parsed)) {
        const hasImageUrl = parsed.some((item: any) => 'imageUrl' in item);
        console.log(`Contains imageUrl: ${hasImageUrl}`);
      }
    } else {
      console.log(`LocalStorage item "${key}" not found`);
    }
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
  }
}