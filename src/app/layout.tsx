import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wealbee — Data Labeling Tool",
  description: "Internal tool for labeling market news data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
