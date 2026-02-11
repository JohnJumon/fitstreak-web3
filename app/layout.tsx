import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitStreak",
  description: "Track workouts and mint streak milestone badges."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
