import "./globals.css";
import Navbar from "@/components/global/Navbar";
import Footer from "@/components/global/Footer";

export const metadata = {
  title: {
    default: "ByLestherGames | Text RPGs de decisiones",
    template: "%s | ByLestherGames",
  },
  description:
    "Simulaciones de texto donde cada decisión tiene consecuencias: atención al cliente, negociación, ventas. Juega, decide, aprende.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CL">
      <body className="bg-[var(--color-canvas)] text-[var(--color-text-primary)] antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
