"use client";

import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";

export default function Footer() {
  const { data } = usePortfolio();
  const { footer } = data;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 space-y-4 md:space-y-0">
          <div>
            &copy; {year}
            {footer.siteName && (
              <>
                {" "}
                <a href="#" className="text-secondary hover:underline font-semibold">
                  {footer.siteName}
                </a>
                .
              </>
            )}
            {footer.copyrightText && <span> {footer.copyrightText}</span>}
          </div>
          <div className="text-center md:text-right">
            Designed By{" "}
            <a
              href="https://htmlcodex.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:underline font-semibold"
            >
              HTML Codex
            </a>{" "}
            Distributed By:{" "}
            <a
              href="https://themewagon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:underline font-semibold"
            >
              ThemeWagon
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
