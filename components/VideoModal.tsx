"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

export default function VideoModal({ isOpen, onClose, videoSrc }: VideoModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm ${
        isClosing ? "animate-backdrop-out" : "animate-backdrop-fade"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl ${
          isClosing ? "animate-modal-pop-out" : "animate-modal-pop"
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors p-2 bg-black/50 rounded-full focus:outline-none"
          aria-label="Close Video Modal"
        >
          <X size={24} />
        </button>

        <div className="relative aspect-video w-full">
          <iframe
            className="w-full h-full"
            src={`${videoSrc}${videoSrc.includes("?") ? "&" : "?"}autoplay=1`}
            title="Video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
