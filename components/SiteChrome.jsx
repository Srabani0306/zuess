"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteQuickForm from "@/components/QuoteQuickForm";
import NewsTicker from "@/components/NewsTicker";
import BetaBanner from "@/components/BetaBanner";

export default function SiteChrome({ navigation, news, socialLinks, children }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return children;

  return (
    <>
      <BetaBanner />
      <NewsTicker news={news} />
      <Navbar navigation={navigation} />
      {children}
      <Footer navigation={navigation} socialLinks={socialLinks} />
      <QuoteQuickForm />
    </>
  );
}
