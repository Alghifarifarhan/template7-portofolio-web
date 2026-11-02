"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";

export default function Navbar() {
  const { data } = usePortfolio();
  const { nav, footer } = data;
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandName = nav?.brandText || footer?.siteName || "";

  const navLinksLeft = [
    nav?.homeText ? { name: nav.homeText, href: "#home", id: "home" } : null,
    nav?.aboutText ? { name: nav.aboutText, href: "#about", id: "about" } : null,
    nav?.skillsText ? { name: nav.skillsText, href: "#skill", id: "skill" } : null,
  ].filter(Boolean) as { name: string; href: string; id: string }[];

  const navLinksRight = [
    nav?.servicesText ? { name: nav.servicesText, href: "#service", id: "service" } : null,
    nav?.projectsText ? { name: nav.projectsText, href: "#project", id: "project" } : null,
    nav?.contactText ? { name: nav.contactText, href: "#contact", id: "contact" } : null,
  ].filter(Boolean) as { name: string; href: string; id: string }[];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      const sections = ["home", "about", "skill", "service", "project", "contact"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace("#", "");
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled ? "shadow-md py-2" : "shadow-sm py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Brand */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "#home")}
            className="lg:hidden text-2xl font-bold text-primary"
          >
            {brandName}
          </a>

          {/* Desktop Left Nav Links */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinksLeft.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`text-lg font-semibold transition-colors duration-200 ${
                    isActive ? "text-primary border-b-2 border-primary" : "text-dark hover:text-primary"
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Desktop Center Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "#home")}
            className="hidden lg:block bg-secondary text-primary font-bold text-3xl px-6 py-2 rounded-sm shadow-sm transition-transform hover:scale-105"
          >
            {brandName}
          </a>

          {/* Desktop Right Nav Links */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinksRight.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`text-lg font-semibold transition-colors duration-200 ${
                    isActive ? "text-primary border-b-2 border-primary" : "text-dark hover:text-primary"
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Mobile Hamburger Button with Smooth Icon Rotation */}
          <div className="flex items-center space-x-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-dark hover:text-primary focus:outline-none transition-transform duration-300 active:scale-95"
              aria-label="Toggle navigation menu"
            >
              <div className={`transition-transform duration-300 transform ${mobileMenuOpen ? "rotate-90" : "rotate-0"}`}>
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu with Slide Down Animation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-3 shadow-lg animate-slide-down-fade">
          {[...navLinksLeft, ...navLinksRight].map((link, idx) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                style={{ animationDelay: `${idx * 40}ms` }}
                className={`block py-2 text-base font-semibold transition-all transform duration-200 ${
                  isActive ? "text-primary font-bold translate-x-1" : "text-dark hover:text-primary hover:translate-x-1"
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </div>
      )}
    </nav>
  );
}
