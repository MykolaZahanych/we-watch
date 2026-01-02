export interface LinkPreview {
  image?: string;
}

export async function fetchLinkPreviewImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogImageMatch && ogImageMatch[1]) {
      let imageUrl = ogImageMatch[1];
      
      if (!imageUrl.startsWith('http')) {
        try {
          const baseUrl = new URL(url);
          imageUrl = new URL(imageUrl, baseUrl.origin).href;
        } catch {
          return null;
        }
      }
      
      return imageUrl;
    }

    return null;
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return null;
  }
}

