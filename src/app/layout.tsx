import "./globals.css";

export const metadata = {
  title: "Games - bylesther.dev",
  description: "Text RPGs por decisiones",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="bg-[var(--color-canvas)] text-[var(--color-text-primary)] min-h-screen flex flex-col">
      <body className="bg-[var(--color-canvas)] text-[var(--color-text-primary)] antialiased min-h-screen flex flex-col">
        <main className="flex-grow flex flex-col w-full">
          {children}
        </main>
      </body>
    </html>
  );
}