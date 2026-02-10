import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Workout Streak + Badge Minting",
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
