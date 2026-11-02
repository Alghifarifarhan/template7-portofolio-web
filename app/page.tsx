"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { usePortfolio } from "@/context/PortfolioContext";
import { trackPageView } from "@/lib/firebase";

export default function Home() {
  const { loading } = usePortfolio();

  useEffect(() => {
    trackPageView();
  }, []);

  if (loading) {
    return <div className="fixed inset-0 bg-white z-[9999]" />;
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Services />
      <Projects />
      <Contact />
      <Footer />
      <BackToTop />
    </main>
  );
}
