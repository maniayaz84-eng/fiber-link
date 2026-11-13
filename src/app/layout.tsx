import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fiber Link",
  description: "Customer portal and admin dashboard for Fiber Link ISP operations.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
