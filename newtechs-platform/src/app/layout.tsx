import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Navigation from "./components/Navigation";
import { Footer } from "./components/Footer";

export const metadata: Metadata = {
  title: "NewTechs - The Coolest Techs on Ice",
  description: "Modern tech blog covering AI, gadgets, reviews, startups, and more. Stay ahead of the tech curve with the coolest technologies.",
  keywords: "technology, tech news, AI, gadgets, reviews, startups, crypto, innovation",
  authors: [{ name: "NewTechs Team" }],
  creator: "NewTechs",
  publisher: "NewTechs",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://yourdomain.com'),
  openGraph: {
    title: "NewTechs - The Coolest Techs on Ice",
    description: "Modern tech blog covering AI, gadgets, reviews, startups, and more.",
    url: "https://yourdomain.com",
    siteName: "NewTechs",
    images: [
      {
        url: "/design_assets/newtechs_logo_main.png",
        width: 1200,
        height: 630,
        alt: "NewTechs - The Coolest Techs on Ice",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NewTechs - The Coolest Techs on Ice",
    description: "Modern tech blog covering AI, gadgets, reviews, startups, and more.",
    images: ["/design_assets/newtechs_logo_main.png"],
    creator: "@newtechs",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/design_assets/newtechs_logo_main.png" />
        <link rel="apple-touch-icon" href="/design_assets/newtechs_logo_main.png" />
        <meta name="theme-color" content="#00D4FF" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

