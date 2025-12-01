import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "بلک لیست",
    short_name: "بلک لیست",
    description: "ردیاب مسابقات گیمینگ ۱ در مقابل ۱",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#f97316",
    orientation: "portrait",
    dir: "rtl",
    lang: "fa",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
