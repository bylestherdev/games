import type { NextConfig } from "next";
import pwa from "next-pwa";

const nextConfig: NextConfig = {
  // Configuración para games.bylesther.dev
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    manifest: {
      name: "Games ByLesterDev",
      short_name: "Games",
      description: "7 Juegos de simulación y gestión",
      theme_color: "#1e1e2f",
      background_color: "#1e1e2f",
      display: "standalone",
      orientation: "portrait",
      start_url: "/",
      icons: [
        {
          src: "/img/og-image.jpg",
          sizes: "192x192",
          type: "image/jpeg",
        },
        {
          src: "/img/og-image.jpg",
          sizes: "512x512",
          type: "image/jpeg",
        },
      ],
    },
  },
};

export default nextConfig;
