"use client";

import React from "react";
import { Crop, GitBranch, Code, Laptop, Layout, Sparkles, Terminal, Cpu } from "lucide-react";
import { usePortfolio, ServiceItem } from "@/context/PortfolioContext";
import ScrollReveal from "./ScrollReveal";

const iconMap: Record<string, React.ElementType> = {
  Crop,
  GitBranch,
  Code,
  Laptop,
  Layout,
  Sparkles,
  Terminal,
  Cpu,
};

export default function Services() {
  const { data } = usePortfolio();
  const { services } = data;

  const title = (services && !Array.isArray(services) && services.title) || "";
  const description = (services && !Array.isArray(services) && services.description) || "";
  const hireMeText = (services && !Array.isArray(services) && services.hireMeText) || "";

  const serviceItems: ServiceItem[] = Array.isArray(services)
    ? services
    : services && Array.isArray(services.items)
    ? services.items
    : [];

  if (!title && !description && !hireMeText && serviceItems.length === 0) {
    return null;
  }

  return (
    <section id="service" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {(title || description || hireMeText) && (
          <ScrollReveal animation="fade-up">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12">
              <div>
                {title && (
                  <h1 className="text-4xl font-extrabold text-dark mb-2">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-gray-600 text-base max-w-2xl">
                    {description}
                  </p>
                )}
              </div>
              {hireMeText && (
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-all duration-200 self-start lg:self-auto mt-4 lg:mt-0"
                >
                  {hireMeText}
                </a>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {serviceItems.map((service, index) => {
            const Icon = iconMap[service.iconName] || Code;
            return (
              <ScrollReveal key={service.id || index} animation="fade-up" delay={index * 100}>
                <div className="flex flex-col sm:flex-row bg-light rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-20 h-20 bg-icon-pattern flex items-center justify-center flex-shrink-0 mb-4 sm:mb-0 rounded-lg">
                    <Icon className="w-10 h-10 text-dark" />
                  </div>
                  <div className="sm:ml-6">
                    <h4 className="text-2xl font-bold text-dark mb-2">{service.title}</h4>
                    {service.price && service.price.trim() !== "" && (
                      <h6 className="text-gray-600 font-semibold mb-3">
                        Start from <span className="text-primary font-bold">{service.price}</span>
                      </h6>
                    )}
                    <p className="text-gray-600 leading-relaxed text-sm">{service.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
