import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "prompt4ai – The #1 website for prompt engineering",
  description: "Search millions of AI prompts for Midjourney, Stable Diffusion, Sora, and leading generative models.",
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
