import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nyaris Terkenal",
  description: "Semakin nggak terkenal, semakin banyak poin.",
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
