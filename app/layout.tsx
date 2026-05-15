import "./globals.css";

export const metadata = {
  title: "SM Review",
  description: "Image review and collections",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
