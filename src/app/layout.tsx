export const metadata = {
  title: "Games - bylesther.dev",
  description: "Games portfolio and projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}