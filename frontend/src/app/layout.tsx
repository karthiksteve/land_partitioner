import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "GeoKurra - Digital Land Information Portal | Government of India",
  description:
    "Access cadastral records, parcel boundaries, and land information from Bihar BhuNaksha. Government of India Digital Land Information Portal.",
  keywords:
    "land records, bhu naksha, bihar, cadastral, gis, parcel search, government of india",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
