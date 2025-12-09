import { NasaImage } from '../types';

export const getNasaImage = async (queryName: string): Promise<NasaImage | null> => {
  try {
    // Adding "planet" or "space" helps filter unrelated results
    const q = `${queryName} space astronomy`;
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page=1`;
    
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const items = data.collection?.items;

    if (items && items.length > 0) {
      // Find first valid image
      const item = items[0];
      const link = item.links?.find((l: any) => l.href.endsWith('.jpg') || l.render === 'image');
      const meta = item.data?.[0];

      if (link && meta) {
        return {
          title: meta.title,
          url: link.href,
          description: meta.description,
          date: meta.date_created?.substring(0, 10) || 'Unknown'
        };
      }
    }
    return null;
  } catch (e) {
    console.warn("NASA API Failed:", e);
    return null;
  }
};