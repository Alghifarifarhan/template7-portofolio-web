"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import VideoModal from "./VideoModal";
import { usePortfolio } from "@/context/PortfolioContext";

export default function Hero() {
  const { data, formatImage } = usePortfolio();
  const { hero } = data;

  const roles = (hero.roles || []).filter((r) => r && r.trim().length > 0);

  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    if (!roles || roles.length === 0) return;
    const safeRoleIndex = currentRoleIndex % roles.length;
    const fullText = roles[safeRoleIndex] || "";
    let typingSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && currentText === fullText) {
      typingSpeed = 2000;
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
      typingSpeed = 500;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && currentText !== fullText) {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      } else if (isDeleting && currentText !== "") {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      } else if (!isDeleting && currentText === fullText) {
        setIsDeleting(true);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentRoleIndex, roles]);

  const profileImageUrl = formatImage(hero.profileImg);
  const hasVideoUrl = Boolean(hero.videoUrl && hero.videoUrl.trim() !== "");
  const hasProfileImg = Boolean(profileImageUrl && profileImageUrl.trim() !== "");

  return (
    <section id="home" className="pt-28 pb-16 md:pt-36 md:pb-24 bg-light bg-header-pattern bg-no-repeat bg-left-top overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${hasProfileImg ? "lg:grid-cols-2" : "max-w-3xl mx-auto text-center"} gap-12 items-center`}>
          {/* Left Content with Entrance Animation */}
          <div className="py-6 animate-fade-in-up">
            {hero.imText && (
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-3">
                {hero.imText}
              </h3>
            )}
            {hero.name && (
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-dark mb-4 tracking-tight">
                {hero.name}
              </h1>
            )}
            {roles.length > 0 && (
              <div className={`h-12 flex items-center ${hasProfileImg ? "" : "justify-center"}`}>
                <span className="text-2xl sm:text-3xl font-semibold text-gray-700">
                  {currentText}
                </span>
                <span className="typed-cursor text-3xl font-light text-dark">|</span>
              </div>
            )}

            <div className={`flex flex-wrap items-center gap-6 pt-8 ${hasProfileImg ? "" : "justify-center"}`}>
              {hero.cvText && (
                <a
                  href={hero.cvLink || "#contact"}
                  target={hero.cvLink && hero.cvLink.startsWith("http") ? "_blank" : "_self"}
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-primary-hover transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {hero.cvText}
                </a>
              )}

              {/* Play Video button - OPTIONAL */}
              {hasVideoUrl && (
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(true)}
                    className="relative group w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white focus:outline-none shadow-lg transition-transform hover:scale-105"
                    aria-label="Play Intro Video"
                  >
                    <span className="absolute inset-0 rounded-full bg-primary opacity-75 animate-pulse-border"></span>
                    <span className="relative z-10 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-12 border-l-white ml-1"></span>
                  </button>
                  {hero.videoText && (
                    <span className="text-lg font-bold text-dark hidden sm:inline-block">
                      {hero.videoText}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Profile Image with Scale-In Entrance Animation */}
          {hasProfileImg && (
            <div className="flex justify-center lg:justify-end animate-scale-in">
              <div className="relative w-full max-w-md aspect-square lg:max-w-lg rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src={profileImageUrl}
                  alt={hero.name || "Profile Photo"}
                  fill
                  unoptimized
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {hasVideoUrl && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoSrc={hero.videoUrl}
        />
      )}
    </section>
  );
}
