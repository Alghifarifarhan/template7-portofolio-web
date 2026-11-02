"use client";

import React, { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import ScrollReveal from "./ScrollReveal";

export default function Skills() {
  const { data } = usePortfolio();
  const { skills } = data;
  const [activeTab, setActiveTab] = useState<"experience" | "education">("experience");

  const skillsList = skills.skillsList && skills.skillsList.length > 0 ? skills.skillsList : [];
  const experiences = skills.experiences && skills.experiences.length > 0 ? skills.experiences : [];
  const educations = skills.educations && skills.educations.length > 0 ? skills.educations : [];

  const hasSkills = skillsList.length > 0;
  const hasExperiences = experiences.length > 0;
  const hasEducations = educations.length > 0;
  const hasTimelines = hasExperiences || hasEducations;

  if (!skills.title && !skills.description && !hasSkills && !hasTimelines) {
    return null;
  }

  return (
    <section id="skill" className="py-20 bg-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title Header */}
        {(skills.title || skills.description) && (
          <ScrollReveal animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              {skills.title && (
                <h1 className="text-4xl font-extrabold text-dark mb-4">
                  {skills.title}
                </h1>
              )}
              {skills.description && (
                <p className="text-gray-600 text-base leading-relaxed">
                  {skills.description}
                </p>
              )}
            </div>
          </ScrollReveal>
        )}

        <div className={`grid grid-cols-1 ${hasSkills && hasTimelines ? "lg:grid-cols-12" : "max-w-3xl mx-auto"} gap-12`}>
          {/* Left Column: Progress Bars */}
          {hasSkills && (
            <div className={hasTimelines ? "lg:col-span-6" : "w-full"}>
              <ScrollReveal animation="fade-up" delay={100}>
                {skills.mySkillsTitle && (
                  <h3 className="text-2xl font-bold text-dark mb-8 border-l-4 border-primary pl-3">
                    {skills.mySkillsTitle}
                  </h3>
                )}

                <div className="space-y-6">
                  {skillsList.map((skill, index) => (
                    <div key={skill.id || index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-dark text-base">{skill.name}</span>
                        <span className="font-bold text-sm text-gray-500">{skill.value}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${skill.value}%`,
                            backgroundColor: skill.color || "var(--color-primary)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          )}

          {/* Right Column: Experience / Education Timelines */}
          {hasTimelines && (
            <div className={hasSkills ? "lg:col-span-6" : "w-full"}>
              <ScrollReveal animation="fade-up" delay={200}>
                {/* Tab Selector Buttons */}
                <div className="flex space-x-4 border-b border-gray-200 mb-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab("experience")}
                    className={`pb-3 font-bold text-lg transition-all border-b-2 ${
                      activeTab === "experience"
                        ? "text-primary border-primary"
                        : "text-gray-400 border-transparent hover:text-dark"
                    }`}
                  >
                    Experience
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("education")}
                    className={`pb-3 font-bold text-lg transition-all border-b-2 ${
                      activeTab === "education"
                        ? "text-primary border-primary"
                        : "text-gray-400 border-transparent hover:text-dark"
                    }`}
                  >
                    Education
                  </button>
                </div>

                {/* Timeline Items */}
                <div className="space-y-6">
                  {activeTab === "experience" &&
                    experiences.map((exp, index) => (
                      <div key={exp.id || index} className="relative pl-6 border-l-2 border-primary/30">
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm" />
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            {exp.period}
                          </span>
                          <h4 className="text-xl font-bold text-dark mt-1">{exp.title}</h4>
                          <p className="text-gray-500 font-medium text-sm">{exp.company}</p>
                        </div>
                      </div>
                    ))}

                  {activeTab === "education" &&
                    educations.map((edu, index) => (
                      <div key={edu.id || index} className="relative pl-6 border-l-2 border-primary/30">
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm" />
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            {edu.period}
                          </span>
                          <h4 className="text-xl font-bold text-dark mt-1">{edu.title}</h4>
                          <p className="text-gray-500 font-medium text-sm">{edu.company}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollReveal>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
