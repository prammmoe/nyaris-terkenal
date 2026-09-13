import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nyaris Terkenal",
  description: "Semakin nggak terkenal, semakin banyak poin.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://nyaris-terkenal.vercel.app",
  ),
  openGraph: {
    title: "Nyaris Terkenal",
    description: "Semakin nggak terkenal, semakin banyak poin.",
    siteName: "Nyaris Terkenal",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nyaris Terkenal",
    description: "Semakin nggak terkenal, semakin banyak poin.",
    images: ["/opengraph-image"],
  },
  icons: { icon: "/favicon.svg" },
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
