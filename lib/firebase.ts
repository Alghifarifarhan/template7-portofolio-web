import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

// ========================================================
// TEMPLATE YOUR_FIREBASE_SDK
// ========================================================
// Masukkan kredensial konfigurasi Firebase Anda di bawah ini
// atau buat file .env.local dan isi variabel lingkungannya.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_FIREBASE_APP_ID",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "YOUR_FIREBASE_MEASUREMENT_ID",
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (Browser only)
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

// Helper to convert Google Drive share links into direct image URLs
export function formatImageUrl(url: string | undefined): string {
  if (!url || typeof url !== "string" || !url.trim()) return "";

  const cleanUrl = url.trim();

  // Pattern 1: standard Google Drive /file/d/FILE_ID/...
  const driveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = cleanUrl.match(driveRegex);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }

  // Pattern 2: id query parameter (e.g. drive.google.com/open?id=ID, uc?id=ID, or thumbnail?id=ID)
  const idRegex = /[?&]id=([a-zA-Z0-9_-]+)/;
  const idMatch = cleanUrl.match(idRegex);
  if (idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  return cleanUrl;
}

// Track page view hits and data transfer stats in Firestore
export async function trackPageView() {
  if (typeof window === "undefined") return;

  try {
    const isNewSession = !sessionStorage.getItem("visited_session");
    if (isNewSession) {
      sessionStorage.setItem("visited_session", "true");
    }

    const statsRef = doc(db, "portfolio", "stats");

    // Average page payload download estimation (~1.5 MB)
    const estimatedDownloadBytes = 1.5 * 1024 * 1024;
    // Average page payload upload estimation (~0.05 MB)
    const estimatedUploadBytes = 0.05 * 1024 * 1024;

    await setDoc(
      statsRef,
      {
        viewsCount: increment(1),
        uniqueVisitors: increment(isNewSession ? 1 : 0),
        totalDownloadBytes: increment(estimatedDownloadBytes),
        totalUploadBytes: increment(estimatedUploadBytes),
        lastVisited: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error tracking page view stats:", error);
  }
}
