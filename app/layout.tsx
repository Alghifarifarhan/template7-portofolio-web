import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { PortfolioProvider } from "@/context/PortfolioContext";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-portfolio-domain.web.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Olifyhub - Personal Portfolio Website",
  description: "Personal Portfolio Website with Modern Design and Dynamic Content Management System.",
  keywords: ["Portfolio", "Personal Portfolio", "Developer", "Designer", "Web Portfolio"],
  icons: {
    icon: [
      { url: "/img/olifyhub.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/img/olifyhub.png",
    apple: [
      { url: "/apple-icon.png", type: "image/png" },
      { url: "/img/olifyhub.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Olifyhub - Personal Portfolio Website",
    description: "Personal Portfolio Website with Modern Design and Dynamic Content Management System.",
    url: siteUrl,
    siteName: "Olifyhub",
    images: [
      {
        url: "/img/olifyhub.png",
        width: 512,
        height: 512,
        alt: "Olifyhub Logo",
        type: "image/png",
      },
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Olifyhub",
        type: "image/png",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Olifyhub - Personal Portfolio Website",
    description: "Personal Portfolio Website with Modern Design and Dynamic Content Management System.",
    images: ["/img/olifyhub.png", "/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSans.variable} scroll-smooth`}>
      <head>
        <link rel="icon" href="/img/olifyhub.png" type="image/png" />
        <link rel="shortcut icon" href="/img/olifyhub.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta property="og:image" content={`${siteUrl}/img/olifyhub.png`} />
        <meta property="og:image:secure_url" content={`${siteUrl}/img/olifyhub.png`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
      </head>
      <body className="font-sans antialiased text-dark bg-white">
        <PortfolioProvider>
          {children}
        </PortfolioProvider>
      </body>
    </html>
  );
}

