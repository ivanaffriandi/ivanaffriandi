import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ivan Affriandi",
    short_name: "Ivan A.",
    description: "Ivan Affriandi — personal portfolio, creative studio, and journal.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable"
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };
}
