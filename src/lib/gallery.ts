export interface GalleryItem {
  id: string;
  title: string;
  location: string;
  date: string;
  url: string;
  story?: string;
  permalink?: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  // --- Dutch Architecture & Cityscapes ---
  {
    id: "IMG-01",
    title: "Amsterdam Canals at Dusk",
    location: "Amsterdam, Netherlands",
    date: "10.25",
    url: "https://loremflickr.com/800/800/amsterdam,canal?lock=1",
    story: "Walking along the historic canals just as the sun set. The warm glow reflecting off the water created an atmosphere that felt suspended in time."
  },
  {
    id: "IMG-02",
    title: "Zaanse Schans Windmills",
    location: "Zaandam, Netherlands",
    date: "09.25",
    url: "https://loremflickr.com/800/800/windmill,dutch?lock=2",
    story: "The iconic green wooden houses and working windmills. A perfect preservation of 18th-century Dutch architectural heritage."
  },
  {
    id: "IMG-03",
    title: "Classic Dutch Townhouses",
    location: "Utrecht, Netherlands",
    date: "08.25",
    url: "https://loremflickr.com/800/800/amsterdam,house?lock=3",
    story: "Narrow facades, large windows, and a slight tilt. These buildings have so much character, telling stories of merchants from centuries ago."
  },
  {
    id: "IMG-04",
    title: "Bicycles on the Bridge",
    location: "Amsterdam, Netherlands",
    date: "07.25",
    url: "https://loremflickr.com/800/800/bicycle,amsterdam?lock=4",
    story: "A quintessential Dutch scene. Countless bicycles locked to a bridge rail with a beautiful canal stretching out in the background."
  },
  {
    id: "IMG-05",
    title: "Modern European Brutalism",
    location: "Rotterdam, Netherlands",
    date: "06.25",
    url: "https://loremflickr.com/800/800/rotterdam,architecture?lock=5",
    story: "Exploring the stark contrast of modern brutalist concrete structures against the typically historic European skyline."
  },
  {
    id: "IMG-06",
    title: "Geometric Structural Shadows",
    location: "The Hague, Netherlands",
    date: "05.25",
    url: "https://loremflickr.com/800/800/hague,architecture?lock=6",
    story: "Caught this perfect intersection of light and shadows beneath an overpass. A complete accident of geometry."
  },

  // --- Museum / Exhibitions ---
  {
    id: "IMG-07",
    title: "Contemporary Art Gallery",
    location: "Rijksmuseum, Amsterdam",
    date: "04.25",
    url: "https://loremflickr.com/800/800/museum,gallery?lock=7",
    story: "Getting lost in the quiet halls of the gallery. The curation here allows every piece of art to breathe and command attention."
  },
  {
    id: "IMG-08",
    title: "Minimalist Mushroom",
    location: "Arnhem Forest, Netherlands",
    date: "03.25",
    url: "/minimalist_mushroom.png",
    story: "Fascinated by the organic architecture of a single wild mushroom. Clean gills, stark high-contrast texture, and perfect natural geometry."
  },
  {
    id: "IMG-09",
    title: "Classical Sculpture Exhibit",
    location: "Mauritshuis, The Hague",
    date: "02.25",
    url: "https://loremflickr.com/800/800/sculpture,museum?lock=9",
    story: "The level of detail carved into marble always leaves me speechless. You can almost see the fabric moving in the stone."
  },
  {
    id: "IMG-10",
    title: "Abstract Art Exhibition",
    location: "Van Gogh Museum, Amsterdam",
    date: "01.25",
    url: "https://loremflickr.com/800/800/abstract,painting?lock=10",
    story: "Standing in front of massive, chaotic brush strokes. There is so much raw emotion conveyed without rendering a single recognizable object."
  },
  {
    id: "IMG-11",
    title: "Framed Masterpieces",
    location: "Kunstmuseum Den Haag",
    date: "12.24",
    url: "https://loremflickr.com/800/800/classic,painting?lock=11",
    story: "A quiet corner filled with classical oil paintings. The ornate golden frames are artworks in themselves."
  },
  {
    id: "IMG-12",
    title: "Historical Archives",
    location: "Amsterdam City Archives",
    date: "11.24",
    url: "https://loremflickr.com/800/800/archive,library?lock=12",
    story: "Walking through rows of centuries-old records. The smell of old paper and the silence of history is incredibly comforting."
  },

  // --- Nature & Landscapes ---
  {
    id: "IMG-13",
    title: "Still Water Gradient",
    location: "Giethoorn, Netherlands",
    date: "10.24",
    url: "https://loremflickr.com/800/800/lake,sunset?lock=13",
    story: "The surface of the lake was so still it perfectly mirrored the pastel twilight sky. Pure serenity."
  },
  {
    id: "IMG-14",
    title: "Swiss Alps Horizon",
    location: "Swiss Alps (46.8182° N)",
    date: "09.24",
    url: "https://loremflickr.com/800/800/alps,mountain?lock=14",
    story: "Looking out over a sea of clouds from the mountain peak. The sheer scale of nature here makes everything else feel beautifully insignificant."
  },
  {
    id: "IMG-15",
    title: "Spring Tulip Fields",
    location: "Keukenhof, Netherlands",
    date: "04.24",
    url: "https://loremflickr.com/800/800/tulip,field,netherlands?lock=15",
    story: "Endless rows of vibrant colors stretching to the horizon. Spring in the Netherlands is an absolute visual feast."
  },
  {
    id: "IMG-16",
    title: "Misty Morning Forest",
    location: "Veluwe, Netherlands",
    date: "08.24",
    url: "https://loremflickr.com/800/800/forest,fog?lock=16",
    story: "An early morning hike through dense fog. The silence was only broken by the sound of crunching leaves under my boots."
  },
  {
    id: "IMG-17",
    title: "Minimalist Sand Ridges",
    location: "Loonse en Drunense Duinen",
    date: "07.24",
    url: "https://loremflickr.com/800/800/sand,dunes?lock=17",
    story: "Wind-sculpted patterns on the sand dunes. Nature creates the most perfect, temporary minimalist art."
  },
  {
    id: "IMG-18",
    title: "Silent Woodland Path",
    location: "Saitama, Japan",
    date: "06.24",
    url: "https://loremflickr.com/800/800/woodland,path?lock=18",
    story: "Found this secluded trail right at dawn. The absolute stillness of the woods felt like it could quiet the loudest of minds."
  },

  // --- Candid & Photo Dump ---
  {
    id: "IMG-19",
    title: "Corner Coffee Shop",
    location: "De Pijp, Amsterdam",
    date: "05.24",
    url: "https://loremflickr.com/800/800/coffee,shop,candid?lock=19",
    story: "My favorite spot to read and edit photos. The aroma of freshly roasted beans here is unmatched."
  },
  {
    id: "IMG-20",
    title: "Street Photography Blur",
    location: "Central Station, Amsterdam",
    date: "04.24",
    url: "https://loremflickr.com/800/800/street,blur,people?lock=20",
    story: "Capturing the fast-paced rush of commuters in the morning. I love the chaotic, blurred energy of city life."
  },
  {
    id: "IMG-21",
    title: "Desk Notes Dump",
    location: "Home Studio",
    date: "03.24",
    url: "https://loremflickr.com/800/800/messy,desk,notes?lock=21",
    story: "A chaotic mess of design sketches, scattered notes, and an empty coffee cup. The beautiful reality of a creative block."
  },
  {
    id: "IMG-22",
    title: "Vintage Camera Collectibles",
    location: "Flea Market, Waterlooplein",
    date: "02.24",
    url: "https://loremflickr.com/800/800/vintage,camera?lock=22",
    story: "Stumbled upon this beautiful collection of old analog cameras. Each one holds decades of undocumented memories."
  },
  {
    id: "IMG-23",
    title: "Candid City Lights",
    location: "Rotterdam Night Walk",
    date: "01.24",
    url: "https://loremflickr.com/800/800/city,night,lights?lock=23",
    story: "The neon glow reflecting off wet pavement after a brief evening rain. The city feels entirely different at night."
  },
  {
    id: "IMG-24",
    title: "Reading on the Move",
    location: "NS Intercity Train",
    date: "12.23",
    url: "https://loremflickr.com/800/800/reading,train,candid?lock=24",
    story: "A quiet moment of solitude captured during a busy commute. There is peace to be found anywhere if you look close enough."
  }
];

export async function getInstagramGallery(): Promise<GalleryItem[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return GALLERY_ITEMS;
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${token}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      console.warn("⚠️ [Instagram API] Failed to fetch Instagram media. Falling back to default mock items.");
      return GALLERY_ITEMS;
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      return GALLERY_ITEMS;
    }

    const instagramItems = data.data
      .filter((item: any) => item.media_type === "IMAGE" || item.media_type === "CAROUSEL_ALBUM")
      .map((item: any, index: number) => {
        let dateString = "05.26";
        try {
          if (item.timestamp) {
            const date = new Date(item.timestamp);
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const yy = String(date.getFullYear()).slice(-2);
            dateString = `${mm}.${yy}`;
          }
        } catch (e) {}

        let title = "Instagram Plate";
        if (item.caption) {
          const firstLine = item.caption.split("\n")[0];
          title = firstLine.length > 50 ? firstLine.substring(0, 47) + "..." : firstLine;
        } else {
          title = `Archived Plate #${index + 1}`;
        }

        return {
          id: item.id || `IG-${index}`,
          title: title,
          location: "Instagram Feed",
          date: dateString,
          url: item.media_url,
          permalink: item.permalink
        };
      });

    return instagramItems.length > 0 ? instagramItems : GALLERY_ITEMS;
  } catch (error) {
    console.error("❌ [Instagram API] Error fetching Instagram gallery:", error);
    return GALLERY_ITEMS;
  }
}

