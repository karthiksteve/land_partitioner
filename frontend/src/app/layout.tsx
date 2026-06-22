import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GeoKurra - AI-Powered Land Partition Decision Support System",
  description:
    "Rule 109 compliant land partition decision support system using AI and GIS technology for fair and equitable land distribution.",
  keywords: ["land partition", "rule 109", "GIS", "AI", "geokurra", "bhunaksha"],
  openGraph: {
    title: "GeoKurra",
    description: "AI-Powered Rule 109 Compliant Land Partition System",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
