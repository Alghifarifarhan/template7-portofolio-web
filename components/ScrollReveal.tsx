"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: "fade-up" | "zoom-in" | "fade-down";
  delay?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  let animationClasses = "";
  if (animation === "fade-up") {
    animationClasses = isVisible
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-8";
  } else if (animation === "zoom-in") {
    animationClasses = isVisible
      ? "opacity-100 scale-100"
      : "opacity-0 scale-95";
  } else if (animation === "fade-down") {
    animationClasses = isVisible
      ? "opacity-100 translate-y-0"
      : "opacity-0 -translate-y-8";
  }

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${animationClasses} ${className}`}
    >
      {children}
    </div>
  );
}
