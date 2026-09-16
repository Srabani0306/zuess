import "./globals.css";
import AmbientBackground from "@/components/AmbientBackground";
import SiteChrome from "@/components/SiteChrome";
import { getNavigation, getNews, getSocialLinks } from "@/lib/content";

export const metadata = {
  title: "Zuess | Chartered Accountants",
  description:
    "Taxation, audit, compliance and advisory services from a chartered accountancy practice built around clear numbers and steady deadlines.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }) {
  const [navigation, news, socialLinks] = await Promise.all([getNavigation(), getNews(), getSocialLinks()]);
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <AmbientBackground />
        <SiteChrome navigation={navigation} news={news} socialLinks={socialLinks}>
          <main>{children}</main>
        </SiteChrome>
      </body>
    </html>
  );
}
