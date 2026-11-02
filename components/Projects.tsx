"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Eye, ExternalLink, X, Calendar, UserCheck, Tag } from "lucide-react";
import { usePortfolio, ProjectItem } from "@/context/PortfolioContext";
import ScrollReveal from "./ScrollReveal";

export default function Projects() {
  const { data, formatImage } = usePortfolio();
  const { projects } = data;

  const title = (projects && !Array.isArray(projects) && projects.title) || "";
  const description = (projects && !Array.isArray(projects) && projects.description) || "";

  const projectItems: ProjectItem[] = Array.isArray(projects)
    ? projects
    : projects && Array.isArray(projects.items)
    ? projects.items
    : [];

  const [filter, setFilter] = useState<string>("*");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedProject(null);
      setIsClosing(false);
    }, 250);
  };

  // Dynamic filter categories
  const categories = Array.from(
    new Set(projectItems.map((p) => p.categoryLabel || p.category).filter((c) => Boolean(c && c.trim())))
  );

  const filteredProjects = projectItems.filter((project) => {
    if (filter === "*") return true;
    return (project.categoryLabel || project.category) === filter;
  });

  if (!title && !description && projectItems.length === 0) {
    return null;
  }

  return (
    <section id="project" className="py-20 bg-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Filter Controls */}
        {(title || description || categories.length > 0) && (
          <ScrollReveal animation="fade-up">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12">
              <div>
                {title && (
                  <h1 className="text-4xl font-extrabold text-dark mb-2">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-gray-600 text-base max-w-xl">
                    {description}
                  </p>
                )}
              </div>
              
              {categories.length > 0 && (
                <div className="flex items-center space-x-6 overflow-x-auto pb-2 mt-4 lg:mt-0">
                  <button
                    type="button"
                    onClick={() => setFilter("*")}
                    className={`text-base font-semibold pb-1 border-b-2 transition-all whitespace-nowrap ${
                      filter === "*"
                        ? "text-primary border-primary font-bold"
                        : "text-dark border-transparent hover:text-primary"
                    }`}
                  >
                    All Projects
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFilter(cat)}
                      className={`text-base font-semibold pb-1 border-b-2 transition-all whitespace-nowrap ${
                        filter === cat
                          ? "text-primary border-primary font-bold"
                          : "text-dark border-transparent hover:text-primary"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => {
            const projectImgUrl = formatImage(project.image);
            return (
              <ScrollReveal key={project.id || index} animation="zoom-in" delay={(index % 3) * 100}>
                <div
                  onClick={() => {
                    setIsClosing(false);
                    setSelectedProject(project);
                  }}
                  className="group cursor-pointer relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] w-full bg-gray-100">
                    {projectImgUrl ? (
                      <Image
                        src={projectImgUrl}
                        alt={project.title || "Project"}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Tag size={32} />
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Preview Info */}
                  <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-dark text-lg group-hover:text-primary transition-colors">
                        {project.title}
                      </h5>
                      <span className="text-xs font-semibold text-gray-500">
                        {project.categoryLabel || "UI/UX Design"}
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <Eye size={18} />
                    </div>
                  </div>

                  {/* Hover Overlay Accent */}
                  <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-center">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h4
                        className="text-xl font-extrabold mb-2 text-button-text"
                        style={{ color: "var(--color-button-text, #ffffff)" }}
                      >
                        {project.title}
                      </h4>
                      <span
                        className="inline-block px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-button-text shadow-sm"
                        style={{ color: "var(--color-button-text, #ffffff)" }}
                      >
                        Click for Details
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* Project Details Modal Popup with Smooth Entrance & Exit Animations */}
      {selectedProject && (
        <div
          onClick={handleCloseModal}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm ${
            isClosing ? "animate-backdrop-out" : "animate-backdrop-fade"
          }`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col ${
              isClosing ? "animate-modal-pop-out" : "animate-modal-pop"
            }`}
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-primary">
              <h3
                className="text-xl font-bold text-button-text"
                style={{ color: "var(--color-button-text, #ffffff)" }}
              >
                {selectedProject.title}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white transition-colors p-1.5 rounded-full hover:bg-black/15 focus:outline-none"
                aria-label="Close Project Modal"
                style={{ color: "var(--color-button-text, #ffffff)" }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Image Banner */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-md border border-gray-200">
                <Image
                  src={formatImage(selectedProject.image)}
                  alt={selectedProject.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              {/* Meta Tags Grid */}
              <div className="flex flex-wrap gap-4 pt-2 border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <Tag size={16} className="text-primary" />
                  <span className="font-semibold text-dark">
                    Category: {selectedProject.categoryLabel || "UI/UX Design"}
                  </span>
                </div>
                {selectedProject.client && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <UserCheck size={16} className="text-primary" />
                    <span className="font-semibold text-dark">Client: {selectedProject.client}</span>
                  </div>
                )}
                {selectedProject.date && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <Calendar size={16} className="text-primary" />
                    <span className="font-semibold text-dark">Date: {selectedProject.date}</span>
                  </div>
                )}
              </div>

              {/* Project Explanation Text */}
              <div>
                <h4 className="text-lg font-bold text-dark mb-2">Project Overview</h4>
                <p className="text-gray-600 leading-relaxed text-base">
                  {selectedProject.description ||
                    "This project showcases specialized design and development principles focused on delivering modern user experiences and impactful results."}
                </p>
              </div>

              {/* External Link Button */}
              {selectedProject.link && (
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover transition-colors"
                  >
                    <span>Visit Live Project</span>
                    <ExternalLink size={18} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
