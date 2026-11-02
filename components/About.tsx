"use client";

import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import ScrollReveal from "./ScrollReveal";

export default function About() {
  const { data, formatImage } = usePortfolio();
  const { about } = data;

  const points = (about.points || [])
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter((p) => p.length > 0);

  const image1Url = formatImage(about.image1);
  const image2Url = formatImage(about.image2);

  const showHappyClients = Boolean(
    (about.happyClientsTitle && about.happyClientsTitle.trim() !== "") ||
    (about.happyClientsCount && about.happyClientsCount.trim() !== "") ||
    (about.happyClientsDesc && about.happyClientsDesc.trim() !== "")
  );

  const showProjectsCompleted = Boolean(
    (about.projectsCompletedTitle && about.projectsCompletedTitle.trim() !== "") ||
    (about.projectsCompletedCount && about.projectsCompletedCount.trim() !== "") ||
    (about.projectsCompletedDesc && about.projectsCompletedDesc.trim() !== "")
  );

  const showStats = showHappyClients || showProjectsCompleted;

  const hasImages = Boolean(image1Url || image2Url);
  const hasYears = Boolean(about.years && about.years.trim() !== "");
  const hasSubtitle = Boolean(about.subtitle && about.subtitle.trim() !== "");
  const hasDescription = Boolean(about.description && about.description.trim() !== "");
  const hasReadMore = Boolean(about.readMoreText && about.readMoreText.trim() !== "");

  return (
    <section id="about" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${hasImages ? "lg:grid-cols-12" : "max-w-3xl mx-auto"} gap-12 items-center`}>
          {/* Left Column - Image Gallery */}
          {hasImages && (
            <div className="lg:col-span-6">
              <ScrollReveal animation="zoom-in">
                <div className="grid grid-cols-2 gap-4">
                  {image1Url && (
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100">
                      <Image
                        src={image1Url}
                        alt="About 1"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                  {image2Url && (
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100 mt-8">
                      <Image
                        src={image2Url}
                        alt="About 2"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>
          )}

          {/* Right Column - Text Bio */}
          <div className={hasImages ? "lg:col-span-6" : "w-full"}>
            <ScrollReveal animation="fade-up" delay={100}>
              {hasYears && (
                <div className="flex items-center space-x-4 mb-4">
                  <h1 className="text-6xl font-extrabold text-primary">
                    {about.years}
                  </h1>
                  {about.yearsLabel && about.yearsLabel.trim() !== "" && (
                    <div className="border-l-4 border-primary pl-4">
                      <h5 className="text-xl font-bold text-dark uppercase tracking-wider">
                        {about.yearsLabel}
                      </h5>
                      <p className="text-gray-500 font-semibold text-sm">Experience</p>
                    </div>
                  )}
                </div>
              )}

              {hasSubtitle && (
                <h2 className="text-3xl font-bold text-dark mb-6 leading-tight">
                  {about.subtitle}
                </h2>
              )}

              {hasDescription && (
                <p className="text-gray-600 mb-6 leading-relaxed text-base">
                  {about.description}
                </p>
              )}

              {points.length > 0 && (
                <div className="space-y-3 mb-8">
                  {points.map((point, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <span className="text-dark font-semibold text-sm sm:text-base">{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {hasReadMore && (
                <a
                  href={about.readMoreLink && about.readMoreLink.trim() !== "" ? about.readMoreLink.trim() : "#contact"}
                  target={
                    about.readMoreLink &&
                    (about.readMoreLink.startsWith("http://") ||
                      about.readMoreLink.startsWith("https://") ||
                      about.readMoreLink.startsWith("mailto:") ||
                      about.readMoreLink.startsWith("tel:") ||
                      about.readMoreLink.startsWith("wa.me"))
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    about.readMoreLink &&
                    (about.readMoreLink.startsWith("http://") ||
                      about.readMoreLink.startsWith("https://"))
                      ? "noreferrer"
                      : undefined
                  }
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-all duration-200"
                >
                  {about.readMoreText}
                </a>
              )}
            </ScrollReveal>
          </div>
        </div>

        {/* Stats Counters Grid */}
        {showStats && (
          <div
            className={`grid grid-cols-1 ${
              showHappyClients && showProjectsCompleted ? "md:grid-cols-2" : "max-w-xl mx-auto"
            } gap-8 mt-16 pt-12 border-t border-gray-100`}
          >
            {showHappyClients && (
              <ScrollReveal animation="fade-up" delay={200}>
                <div className="flex items-center bg-light rounded-xl p-6 border border-gray-100 shadow-sm h-full">
                  {about.happyClientsCount && about.happyClientsCount.trim() !== "" && (
                    <div className="w-16 h-16 bg-icon-pattern flex items-center justify-center flex-shrink-0 rounded-lg">
                      <span className="text-2xl font-bold text-dark">
                        {about.happyClientsCount}
                      </span>
                    </div>
                  )}
                  <div className={about.happyClientsCount && about.happyClientsCount.trim() !== "" ? "ml-6" : ""}>
                    {about.happyClientsTitle && about.happyClientsTitle.trim() !== "" && (
                      <h4 className="text-xl font-bold text-dark mb-1">
                        {about.happyClientsTitle}
                      </h4>
                    )}
                    {about.happyClientsDesc && about.happyClientsDesc.trim() !== "" && (
                      <p className="text-gray-500 text-sm">
                        {about.happyClientsDesc}
                      </p>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {showProjectsCompleted && (
              <ScrollReveal animation="fade-up" delay={300}>
                <div className="flex items-center bg-light rounded-xl p-6 border border-gray-100 shadow-sm h-full">
                  {about.projectsCompletedCount && about.projectsCompletedCount.trim() !== "" && (
                    <div className="w-16 h-16 bg-icon-pattern flex items-center justify-center flex-shrink-0 rounded-lg">
                      <span className="text-2xl font-bold text-dark">
                        {about.projectsCompletedCount}
                      </span>
                    </div>
                  )}
                  <div className={about.projectsCompletedCount && about.projectsCompletedCount.trim() !== "" ? "ml-6" : ""}>
                    {about.projectsCompletedTitle && about.projectsCompletedTitle.trim() !== "" && (
                      <h4 className="text-xl font-bold text-dark mb-1">
                        {about.projectsCompletedTitle}
                      </h4>
                    )}
                    {about.projectsCompletedDesc && about.projectsCompletedDesc.trim() !== "" && (
                      <p className="text-gray-500 text-sm">
                        {about.projectsCompletedDesc}
                      </p>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
