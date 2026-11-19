import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GradRunway — Campus-to-Career Financial Stress-Tester",
  description:
    "Small Money, Big Plan. A zero-login fintech dashboard that stress-tests your cash runway from campus to first paycheck.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
