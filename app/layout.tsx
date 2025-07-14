import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { DM_Sans } from "next/font/google";
const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Address Validator",
  description:
    "Verify addresses and search locations with GraphQL and Google Maps",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
