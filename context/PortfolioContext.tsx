"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, formatImageUrl } from "@/lib/firebase";

export interface SkillItem {
  id: string;
  name: string;
  value: number;
  color: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  period: string;
  company: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  price: string;
  description: string;
  iconName: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: "first" | "second";
  categoryLabel: string;
  image: string;
  description?: string;
  client?: string;
  date?: string;
  link?: string;
}

export interface PortfolioTheme {
  primaryColor: string;
  primaryHoverColor: string;
  secondaryColor: string;
  lightBgColor: string;
  darkBgColor: string;
  textColor: string;
  headingColor: string;
  mutedTextColor: string;
  buttonTextColor: string;
  bodyBgColor: string;
}

export interface PortfolioData {
  nav: {
    homeText: string;
    aboutText: string;
    skillsText: string;
    servicesText: string;
    projectsText: string;
    contactText: string;
    brandText: string;
  };
  hero: {
    imText: string;
    name: string;
    roles: string[];
    cvText: string;
    cvLink: string;
    videoUrl: string;
    videoText: string;
    profileImg: string;
  };
  about: {
    years: string;
    yearsLabel: string;
    subtitle: string;
    description: string;
    points: string[];
    happyClientsTitle: string;
    happyClientsCount: string;
    happyClientsDesc: string;
    projectsCompletedTitle: string;
    projectsCompletedCount: string;
    projectsCompletedDesc: string;
    readMoreText: string;
    readMoreLink?: string;
    image1: string;
    image2: string;
  };
  skills: {
    title: string;
    description: string;
    mySkillsTitle: string;
    skillsList: SkillItem[];
    experiences: TimelineItem[];
    educations: TimelineItem[];
  };
  services: {
    title: string;
    description: string;
    hireMeText: string;
    items: ServiceItem[];
  };
  projects: {
    title: string;
    description: string;
    items: ProjectItem[];
  };
  contact: {
    title: string;
    buttonText: string;
    description: string;
    office: string;
    phone: string;
    email: string;
    twitterUrl: string;
    facebookUrl: string;
    youtubeUrl: string;
    linkedinUrl: string;
    instagramUrl: string;
    githubUrl?: string;
    formspreeUrl: string;
  };
  theme: PortfolioTheme;
  footer: {
    siteName: string;
    copyrightText: string;
    designerText: string;
    designerUrl: string;
  };
}

export const defaultPortfolioData: PortfolioData = {
  nav: {
    homeText: "",
    aboutText: "",
    skillsText: "",
    servicesText: "",
    projectsText: "",
    contactText: "",
    brandText: "",
  },
  hero: {
    imText: "",
    name: "",
    roles: [],
    cvText: "",
    cvLink: "",
    videoUrl: "",
    videoText: "",
    profileImg: "",
  },
  about: {
    years: "",
    yearsLabel: "",
    subtitle: "",
    description: "",
    points: [],
    happyClientsTitle: "",
    happyClientsCount: "",
    happyClientsDesc: "",
    projectsCompletedTitle: "",
    projectsCompletedCount: "",
    projectsCompletedDesc: "",
    readMoreText: "",
    readMoreLink: "",
    image1: "",
    image2: "",
  },
  skills: {
    title: "",
    description: "",
    mySkillsTitle: "",
    skillsList: [],
    experiences: [],
    educations: [],
  },
  services: {
    title: "",
    description: "",
    hireMeText: "",
    items: [],
  },
  projects: {
    title: "",
    description: "",
    items: [],
  },
  contact: {
    title: "",
    buttonText: "",
    description: "",
    office: "",
    phone: "",
    email: "",
    twitterUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
    githubUrl: "",
    formspreeUrl: "",
  },
  theme: {
    primaryColor: "#6244C5",
    primaryHoverColor: "#5034b0",
    secondaryColor: "#FFC448",
    lightBgColor: "#FAFAFB",
    darkBgColor: "#12141D",
    textColor: "#12141D",
    headingColor: "#12141D",
    mutedTextColor: "#6B7280",
    buttonTextColor: "#FFFFFF",
    bodyBgColor: "#ffffff",
  },
  footer: {
    siteName: "",
    copyrightText: "",
    designerText: "HTML Codex",
    designerUrl: "https://htmlcodex.com",
  },
};

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  theme: PortfolioTheme;
}

export const themePresets: ThemePreset[] = [
  {
    id: "preset-1",
    name: "Classic Purple",
    description: "Ungu Elegan & Emas (Classic Purple)",
    theme: {
      primaryColor: "#6244C5",
      primaryHoverColor: "#5034B0",
      secondaryColor: "#FFC448",
      headingColor: "#12141D",
      textColor: "#374151",
      mutedTextColor: "#6B7280",
      buttonTextColor: "#FFFFFF",
      lightBgColor: "#FAFAFB",
      darkBgColor: "#12141D",
      bodyBgColor: "#ffffff",
    },
  },
  {
    id: "preset-2",
    name: "Emerald Green",
    description: "Hijau Zamrud & Dark Slate",
    theme: {
      primaryColor: "#10B981",
      primaryHoverColor: "#059669",
      secondaryColor: "#FFFFFF",
      headingColor: "#0F172A",
      textColor: "#334155",
      mutedTextColor: "#64748B",
      buttonTextColor: "#FFFFFF",
      lightBgColor: "#F8FAFC",
      darkBgColor: "#0F172A",
      bodyBgColor: "#ffffff",
    },
  },
  {
    id: "preset-3",
    name: "Royal Blue",
    description: "Biru Modern & Slate",
    theme: {
      primaryColor: "#2563EB",
      primaryHoverColor: "#1D4ED8",
      secondaryColor: "#FFFFFF",
      headingColor: "#1E293B",
      textColor: "#475569",
      mutedTextColor: "#64748B",
      buttonTextColor: "#FFFFFF",
      lightBgColor: "#F1F5F9",
      darkBgColor: "#0F172A",
      bodyBgColor: "#ffffff",
    },
  },
  {
    id: "preset-4",
    name: "Modern Violet",
    description: "Ungu Violet & Dark Charcoal",
    theme: {
      primaryColor: "#8B5CF6",
      primaryHoverColor: "#7C3AED",
      secondaryColor: "#FFFFFF",
      headingColor: "#000000",
      textColor: "#E5E7EB",
      mutedTextColor: "#9CA3AF",
      buttonTextColor: "#FFFFFF",
      lightBgColor: "#F5F0FF",
      darkBgColor: "#111827",
      bodyBgColor: "#ffffff",
    },
  },
  {
    id: "preset-5",
    name: "Warm Amber",
    description: "Kuning Amber & Warm Stone",
    theme: {
      primaryColor: "#F59E0B",
      primaryHoverColor: "#D97706",
      secondaryColor: "#FFFFFF",
      headingColor: "#1F1A24",
      textColor: "#4A4352",
      mutedTextColor: "#78716C",
      buttonTextColor: "#FFFFFF",
      lightBgColor: "#FAFAF9",
      darkBgColor: "#1C1917",
      bodyBgColor: "#ffffff",
    },
  },
];

export const normalizePortfolioData = (raw: any): PortfolioData => {
  if (!raw || typeof raw !== "object") {
    return defaultPortfolioData;
  }

  // Safe normalization for services
  let normalizedServices = { ...defaultPortfolioData.services };
  if (Array.isArray(raw.services)) {
    normalizedServices.items = raw.services;
  } else if (raw.services && typeof raw.services === "object") {
    normalizedServices = {
      ...defaultPortfolioData.services,
      ...raw.services,
      items: Array.isArray(raw.services.items)
        ? raw.services.items
        : Array.isArray(raw.services)
        ? raw.services
        : [],
    };
  }

  // Safe normalization for projects
  let normalizedProjects = { ...defaultPortfolioData.projects };
  if (Array.isArray(raw.projects)) {
    normalizedProjects.items = raw.projects;
  } else if (raw.projects && typeof raw.projects === "object") {
    normalizedProjects = {
      ...defaultPortfolioData.projects,
      ...raw.projects,
      items: Array.isArray(raw.projects.items)
        ? raw.projects.items
        : Array.isArray(raw.projects)
        ? raw.projects
        : [],
    };
  }

  return {
    ...defaultPortfolioData,
    ...raw,
    nav: { ...defaultPortfolioData.nav, ...(raw.nav || {}) },
    hero: {
      ...defaultPortfolioData.hero,
      ...(raw.hero || {}),
      roles: Array.isArray(raw.hero?.roles) ? raw.hero.roles : [],
    },
    about: {
      ...defaultPortfolioData.about,
      ...(raw.about || {}),
      points: Array.isArray(raw.about?.points) ? raw.about.points : [],
    },
    skills: {
      ...defaultPortfolioData.skills,
      ...(raw.skills || {}),
      skillsList: Array.isArray(raw.skills?.skillsList) ? raw.skills.skillsList : [],
      experiences: Array.isArray(raw.skills?.experiences) ? raw.skills.experiences : [],
      educations: Array.isArray(raw.skills?.educations) ? raw.skills.educations : [],
    },
    services: normalizedServices,
    projects: normalizedProjects,
    contact: { ...defaultPortfolioData.contact, ...(raw.contact || {}) },
    theme: { ...defaultPortfolioData.theme, ...(raw.theme || {}) },
    footer: { ...defaultPortfolioData.footer, ...(raw.footer || {}) },
  };
};

const CACHE_KEY = "portfolio_content_cache";
const SYNC_CHANNEL_NAME = "portfolio_live_sync_channel";

const getCachedPortfolioData = (): PortfolioData => {
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return normalizePortfolioData(parsed);
      }
    } catch (e) {
      console.error("Error reading portfolio cache from localStorage:", e);
    }
  }
  return defaultPortfolioData;
};

// Function to apply theme variables dynamically to CSS & DOM root
export const applyPortfolioTheme = (theme: PortfolioTheme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const safeTheme = theme || defaultPortfolioData.theme;

  const primary = safeTheme.primaryColor || "#6244C5";
  const primaryHover = safeTheme.primaryHoverColor || "#5034b0";
  const secondary = safeTheme.secondaryColor || "#FFC448";
  const lightBg = safeTheme.lightBgColor || "#FAFAFB";
  const darkBg = safeTheme.darkBgColor || "#12141D";
  const text = safeTheme.textColor || "#12141D";
  const heading = safeTheme.headingColor || "#12141D";
  const mutedText = safeTheme.mutedTextColor || "#6B7280";
  const buttonText = safeTheme.buttonTextColor || "#FFFFFF";
  const bodyBg = safeTheme.bodyBgColor || "#ffffff";

  root.style.setProperty("--color-primary", primary);
  root.style.setProperty("--color-primary-hover", primaryHover);
  root.style.setProperty("--color-secondary", secondary);
  root.style.setProperty("--color-light", lightBg);
  root.style.setProperty("--color-dark", darkBg);
  root.style.setProperty("--color-text", text);
  root.style.setProperty("--color-heading", heading);
  root.style.setProperty("--color-muted-text", mutedText);
  root.style.setProperty("--color-button-text", buttonText);
  root.style.setProperty("--color-body-bg", bodyBg);

  if (document.body) {
    document.body.style.backgroundColor = bodyBg;
    document.body.style.color = text;
  }
};

interface ContextType {
  data: PortfolioData;
  loading: boolean;
  saveData: (newData: PortfolioData) => Promise<void>;
  formatImage: (url: string | undefined) => string;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonStringOrObj: string | object) => Promise<PortfolioData>;
}

const PortfolioContext = createContext<ContextType>({
  data: defaultPortfolioData,
  loading: true,
  saveData: async () => {},
  formatImage: formatImageUrl,
  exportDatabaseJson: () => {},
  importDatabaseJson: async () => defaultPortfolioData,
});

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData>(getCachedPortfolioData);
  const [loading, setLoading] = useState<boolean>(true);

  // Apply theme whenever data.theme updates
  useEffect(() => {
    applyPortfolioTheme(data.theme);
  }, [data.theme]);

  useEffect(() => {
    // 1. Initial theme apply
    applyPortfolioTheme(data.theme);

    // 2. Real-time broadcast channel for instant multi-tab sync
    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data && event.data.type === "PORTFOLIO_DATA_UPDATED" && event.data.payload) {
            const updated = normalizePortfolioData(event.data.payload);
            setData(updated);
            applyPortfolioTheme(updated.theme);
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel not supported or error initializing:", err);
      }
    }

    // 3. Storage event listener for cross-tab synchronization fallback
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CACHE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const updated = normalizePortfolioData(parsed);
          setData(updated);
          applyPortfolioTheme(updated.theme);
        } catch (err) {
          console.error("Failed to parse updated localStorage content:", err);
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
    }

    // 4. Firestore real-time onSnapshot listener
    const docRef = doc(db, "portfolio", "content");
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const snapshotData = snapshot.data();
          const mergedData = normalizePortfolioData(snapshotData);

          setData(mergedData);
          applyPortfolioTheme(mergedData.theme);

          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(mergedData));
            } catch (err) {
              console.error("Error saving portfolio cache to localStorage:", err);
            }
          }
        } else {
          applyPortfolioTheme(defaultPortfolioData.theme);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore snapshot error:", error);
        applyPortfolioTheme(data.theme || defaultPortfolioData.theme);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      if (channel) {
        channel.close();
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageChange);
      }
    };
  }, []);

  const broadcastUpdate = (updatedData: PortfolioData) => {
    if (typeof window !== "undefined") {
      // LocalStorage update triggers storage events in other tabs
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updatedData));
      } catch (err) {
        console.error("Error saving portfolio cache to localStorage:", err);
      }

      // BroadcastChannel triggers immediate message in other tabs
      if ("BroadcastChannel" in window) {
        try {
          const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
          channel.postMessage({
            type: "PORTFOLIO_DATA_UPDATED",
            payload: updatedData,
          });
          channel.close();
        } catch (e) {
          console.warn("Error broadcasting update:", e);
        }
      }
    }
  };

  const saveData = async (newData: PortfolioData) => {
    const normalized = normalizePortfolioData(newData);
    const docRef = doc(db, "portfolio", "content");

    // Immediately update local state & apply theme for instantaneous UI responsiveness
    setData(normalized);
    applyPortfolioTheme(normalized.theme);
    broadcastUpdate(normalized);

    // Persist directly to Firestore
    await setDoc(docRef, normalized, { merge: true });
  };

  const exportDatabaseJson = () => {
    if (typeof window === "undefined") return;
    try {
      const exportContent = {
        _exportInfo: {
          exportedAt: new Date().toISOString(),
          version: "1.0",
          template: "template_7",
          author: "Portfolio CMS",
        },
        ...data,
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportContent, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", "database.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error("Error exporting database.json:", error);
      throw error;
    }
  };

  const importDatabaseJson = async (jsonStringOrObj: string | object): Promise<PortfolioData> => {
    let parsedObj: any;
    if (typeof jsonStringOrObj === "string") {
      try {
        parsedObj = JSON.parse(jsonStringOrObj);
      } catch (err) {
        throw new Error("Format file JSON tidak valid. Pastikan file berformat JSON yang benar.");
      }
    } else {
      parsedObj = jsonStringOrObj;
    }

    if (!parsedObj || typeof parsedObj !== "object") {
      throw new Error("File JSON kosong atau strukturnya tidak valid.");
    }

    // Clean internal metadata if present
    const cleanRaw = { ...parsedObj };
    if ("_exportInfo" in cleanRaw) {
      delete cleanRaw._exportInfo;
    }

    const normalized = normalizePortfolioData(cleanRaw);
    await saveData(normalized);
    return normalized;
  };

  return (
    <PortfolioContext.Provider
      value={{
        data,
        loading,
        saveData,
        formatImage: formatImageUrl,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
