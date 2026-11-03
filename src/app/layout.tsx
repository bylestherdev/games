import "./globals.css";
import Navbar from "@/components/global/Navbar";
import Footer from "@/components/global/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://games.bylesther.dev"),
  title: {
    default: "ByLestherGames | Text RPGs de decisiones y negocios",
    template: "%s | ByLestherGames",
  },
  description:
    "Simulaciones de texto inmersivas donde cada decisión tiene consecuencias reales: atención al cliente, negociación maestra y prospección B2B. Juega, decide, aprende y desbloquea logros.",
  keywords: [
    "text rpg",
    "juegos de decisiones",
    "simulador de ventas",
    "negociación",
    "atención al cliente",
    "prospección B2B",
    "gamificación",
    "bylesther",
  ],
  authors: [{ name: "Lesther Dev", url: "https://bylesther.dev" }],
  creator: "Lesther Dev",
  publisher: "ByLesther Dev",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://games.bylesther.dev",
    title: "ByLestherGames | Text RPGs de decisiones y negocios",
    description:
      "Simulaciones de texto inmersivas donde cada decisión tiene consecuencias reales. Sin distracciones, solo tú, una escena y tres caminos.",
    siteName: "ByLestherGames",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ByLestherGames - Text RPGs de decisiones",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ByLestherGames | Text RPGs de decisiones y negocios",
    description:
      "Simulaciones de texto inmersivas donde cada decisión tiene consecuencias reales.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  other: {
    "geo.region": "CL",
    "geo.placename": "Santiago",
    "geo.position": "-33.4489;-70.6693",
    "ICBM": "-33.4489, -70.6693",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CL">
      <head>
        <meta name="theme-color" content="#09090E" />
      </head>
      <body className="bg-[var(--color-canvas)] text-[var(--color-text-primary)] antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
