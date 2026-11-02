"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updatePassword,
  signOut,
  User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  Palette,
  User as UserIcon,
  Info,
  Zap,
  Briefcase,
  FolderKanban,
  PhoneCall,
  FileText,
  Save,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Compass,
  KeyRound,
  BarChart3,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Image as LucideImageIcon,
  Database,
  Download,
  Upload,
  FileJson,
} from "lucide-react";
import { auth, db, formatImageUrl } from "@/lib/firebase";
import {
  usePortfolio,
  PortfolioData,
  defaultPortfolioData,
  themePresets,
  SkillItem,
  TimelineItem,
  ServiceItem,
  ProjectItem,
} from "@/context/PortfolioContext";

interface StatsData {
  viewsCount: number;
  uniqueVisitors: number;
  totalDownloadBytes: number;
  totalUploadBytes: number;
  lastVisited?: any;
}

function DriveImagePreview({
  url,
  label = "Preview Gambar",
  aspectRatio = "aspect-video",
  className = "",
}: {
  url: string | undefined;
  label?: string;
  aspectRatio?: string;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const formattedUrl = formatImageUrl(url);

  useEffect(() => {
    setImageError(false);
  }, [url]);

  return (
    <div className={`p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
          <LucideImageIcon size={14} className="text-primary" />
          {label}
        </span>
        {formattedUrl && !imageError ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
            Live Preview
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-600">
            Preview Box
          </span>
        )}
      </div>

      <div
        className={`relative w-full ${aspectRatio} rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center`}
      >
        {formattedUrl && !imageError ? (
          <Image
            src={formattedUrl}
            alt={label}
            fill
            unoptimized
            onError={() => setImageError(true)}
            className="object-cover"
          />
        ) : formattedUrl && imageError ? (
          <div className="p-3 text-center flex flex-col items-center justify-center space-y-1 text-amber-700 bg-amber-50 w-full h-full">
            <AlertCircle size={20} className="text-amber-500" />
            <p className="text-[11px] font-semibold">Gagal memuat gambar</p>
            <p className="text-[10px] text-gray-500 max-w-xs leading-tight">
              Pastikan link Google Drive sudah diatur ke <strong>&quot;Anyone with the link can view&quot;</strong> (Publik).
            </p>
          </div>
        ) : (
          <div className="p-4 text-center flex flex-col items-center justify-center space-y-1 text-gray-400">
            <LucideImageIcon size={26} className="text-gray-300 stroke-[1.5]" />
            <p className="text-[11px] font-medium text-gray-500">Belum ada gambar</p>
            <p className="text-[10px] text-gray-400">Masukkan link Google Drive atau URL gambar di atas</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const {
    data: contextData,
    saveData,
    exportDatabaseJson,
    importDatabaseJson,
  } = usePortfolio();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Database Backup / Import State
  const [isDownloadingJson, setIsDownloadingJson] = useState(false);
  const [isImportingJson, setIsImportingJson] = useState(false);
  const [dbStatusMessage, setDbStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Change Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStatusMessage, setPasswordStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Real-time Visitor Stats State
  const [stats, setStats] = useState<StatsData>({
    viewsCount: 0,
    uniqueVisitors: 0,
    totalDownloadBytes: 0,
    totalUploadBytes: 0,
  });

  // Admin CMS State
  const [formData, setFormData] = useState<PortfolioData>(contextData);
  const [activeTab, setActiveTab] = useState<
    | "analytics"
    | "theme"
    | "nav"
    | "hero"
    | "about"
    | "skills"
    | "services"
    | "projects"
    | "contact"
    | "footer"
    | "settings"
  >("analytics");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  const [presetAppliedMessage, setPresetAppliedMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (contextData) {
      setFormData(contextData);
    }
  }, [contextData]);

  // Real-time listener for Firestore stats
  useEffect(() => {
    if (!user) return;
    const statsDocRef = doc(db, "portfolio", "stats");
    const unsubStats = onSnapshot(
      statsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          setStats({
            viewsCount: d.viewsCount || 0,
            uniqueVisitors: d.uniqueVisitors || 0,
            totalDownloadBytes: d.totalDownloadBytes || 0,
            totalUploadBytes: d.totalUploadBytes || 0,
            lastVisited: d.lastVisited,
          });
        }
      },
      (err) => console.error("Error listening to Firestore stats:", err)
    );
    return () => unsubStats();
  }, [user]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setLoginError(err.message || "Failed to sign in. Please check your credentials.");
      } else {
        setLoginError("Failed to sign in. Please check your credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await signOut(auth);
  };

  // Handle Admin Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatusMessage(null);

    if (!user) {
      setPasswordStatusMessage({ type: "error", text: "You must be signed in to change your password." });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordStatusMessage({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatusMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await updatePassword(user, newPassword);
      setPasswordStatusMessage({ type: "success", text: "Password changed successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        if (err.message.includes("requires-recent-login")) {
          setPasswordStatusMessage({
            type: "error",
            text: "For security reasons, please log out and log back in before changing your password.",
          });
        } else {
          setPasswordStatusMessage({ type: "error", text: err.message || "Failed to update password." });
        }
      } else {
        setPasswordStatusMessage({ type: "error", text: "Failed to update password." });
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Save changes to Firebase Firestore
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccessMessage("");
    try {
      await saveData(formData);
      setSaveSuccessMessage("All portfolio changes saved successfully to Firebase!");
      setTimeout(() => setSaveSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save changes to Firebase. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  // Clear all sample text & images directly from Firebase hosting database & local cache
  const [isClearing, setIsClearing] = useState(false);
  const handleClearAllSampleData = async () => {
    const confirmed = confirm(
      "Apakah Anda yakin ingin menghapus seluruh teks dan gambar contoh/bawaan? Tindakan ini akan mengosongkan seluruh konten di database hosting agar Anda dapat mengisinya dari awal."
    );
    if (!confirmed) return;

    setIsClearing(true);
    try {
      const cleanData: PortfolioData = {
        ...defaultPortfolioData,
        theme: formData.theme || defaultPortfolioData.theme,
      };
      await saveData(cleanData);
      setFormData(cleanData);
      setSaveSuccessMessage("Semua teks & gambar contoh berhasil dihapus bersih dari database hosting!");
      setTimeout(() => setSaveSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error clearing sample data:", error);
      alert("Gagal menghapus data contoh. Silakan periksa koneksi atau console.");
    } finally {
      setIsClearing(false);
    }
  };

  // Reset form to defaults
  const handleResetDefaults = () => {
    handleClearAllSampleData();
  };

  // Handle Download database.json
  const handleDownloadDatabase = () => {
    setIsDownloadingJson(true);
    setDbStatusMessage(null);
    try {
      exportDatabaseJson();
      setDbStatusMessage({
        type: "success",
        text: "File database.json berhasil diunduh dari Firestore!",
      });
      setTimeout(() => setDbStatusMessage(null), 5000);
    } catch (err: unknown) {
      console.error(err);
      setDbStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengunduh file database.json.",
      });
    } finally {
      setIsDownloadingJson(false);
    }
  };

  // Handle Import / Upload database.json
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = confirm(
      `Apakah Anda yakin ingin mengimpor database dari file "${file.name}"?\nData di database Firestore akan diperbarui dan tampilan website akan otomatis tersinkronisasi secara real-time.`
    );
    if (!confirmed) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsImportingJson(true);
    setDbStatusMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileContent = event.target?.result as string;
        const updatedData = await importDatabaseJson(fileContent);
        setFormData(updatedData);
        setDbStatusMessage({
          type: "success",
          text: `File "${file.name}" berhasil diimpor & disimpan ke Firestore! Website utama otomatis terupdate secara real-time.`,
        });
        setTimeout(() => setDbStatusMessage(null), 6000);
      } catch (err: unknown) {
        console.error("Import error:", err);
        setDbStatusMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Gagal mengimpor file database.json.",
        });
      } finally {
        setIsImportingJson(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      setDbStatusMessage({
        type: "error",
        text: "Terjadi kesalahan saat membaca file dari komputer.",
      });
      setIsImportingJson(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    reader.readAsText(file);
  };

  // Format Bytes helper
  const formatMB = (bytes: number) => {
    if (!bytes || bytes === 0) return "0.0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const navTabs = [
    { id: "analytics", label: "Analytics & Visitor Stats", icon: BarChart3 },
    { id: "theme", label: "Theme & Colors", icon: Palette },
    { id: "nav", label: "Navigation Menu", icon: Compass },
    { id: "hero", label: "Header & Hero", icon: UserIcon },
    { id: "about", label: "About & Stats", icon: Info },
    { id: "skills", label: "Skills & Timeline", icon: Zap },
    { id: "services", label: "What I Do", icon: Briefcase },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "contact", label: "Contact & Formspree", icon: PhoneCall },
    { id: "footer", label: "Footer & Credits", icon: FileText },
    { id: "settings", label: "Account & Password", icon: KeyRound },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="flex items-center space-x-3 text-primary">
          <RefreshCw className="w-7 h-7 animate-spin" />
          <span className="text-lg font-bold">Loading Firebase Admin...</span>
        </div>
      </div>
    );
  }

  // --- MOBILE RESPONSIVE LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-dark to-black p-4 sm:p-6">
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark">Admin Login</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Sign in with your Firebase Auth credentials to manage your portfolio CMS
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p>{loginError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm text-dark"
                />
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3.5 top-3 sm:top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm text-dark"
                />
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3.5 top-3 sm:top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 sm:top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 sm:py-3.5 bg-primary text-white font-bold text-sm sm:text-base rounded-xl shadow-lg hover:bg-primary-hover transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Admin Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-100 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-xs sm:text-sm font-semibold text-primary hover:underline space-x-1"
            >
              <span>Back to Public Website</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- MOBILE RESPONSIVE ADMIN CMS DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Fixed Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-md">
              P
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-dark flex items-center space-x-2">
                <span>Portfolio Admin</span>
                <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
                  Firebase
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 truncate max-w-[200px] sm:max-w-none">
                {user.email}
              </p>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={handleClearAllSampleData}
              disabled={isClearing || isSaving}
              className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center space-x-1.5 disabled:opacity-50"
              title="Hapus Seluruh Teks & Gambar Contoh dari Database Hosting"
            >
              {isClearing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
              ) : (
                <Trash2 className="w-4 h-4 text-rose-600" />
              )}
              <span className="hidden sm:inline">{isClearing ? "Menghapus..." : "Hapus Data Contoh"}</span>
              <span className="inline sm:hidden">{isClearing ? "..." : "Hapus Contoh"}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isClearing}
              className="flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 sm:py-2.5 bg-primary text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-primary-hover transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-100 text-dark font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-1 text-xs sm:text-sm"
              title="View Site"
            >
              <span className="hidden sm:inline">View Site</span>
              <ExternalLink size={15} />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 sm:px-4 sm:py-2.5 bg-rose-50 text-rose-600 font-semibold rounded-xl hover:bg-rose-100 transition-colors flex items-center space-x-1 text-xs sm:text-sm"
              title="Logout"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {saveSuccessMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-center text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2">
            <CheckCircle2 size={16} />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </header>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* MOBILE HORIZONTAL SCROLLABLE TAB NAV (Shown only on small screens < lg) */}
        <div className="lg:hidden col-span-1 border-b border-gray-200 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none flex space-x-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm font-bold"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* DESKTOP SIDEBAR NAV (Hidden on mobile < lg) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-1">
          <nav className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 space-y-1 sticky top-24">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">
              CMS Sections
            </p>
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-dark"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClearAllSampleData}
                disabled={isClearing || isSaving}
                className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-rose-600 bg-rose-50/60 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-colors flex items-center space-x-2"
              >
                <Trash2 size={14} className="text-rose-600 flex-shrink-0" />
                <span>{isClearing ? "Menghapus..." : "Hapus Semua Data Contoh"}</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Content Form Area */}
        <main className="lg:col-span-9 bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-gray-200 w-full overflow-x-hidden">
          {/* TAB 1: ANALYTICS & VISITOR STATS */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-dark mb-1">Website Traffic &amp; Data Analytics</h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Real-time statistics of visitor traffic, page views, and estimated network data transfer.
                </p>
              </div>
              <hr className="border-gray-200" />

              {/* Metrics Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-100">Total Page Views</span>
                    <BarChart3 className="w-5 h-5 text-purple-200" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ color: "#ffffff" }}>
                    {stats.viewsCount.toLocaleString()}
                  </h3>
                  <p className="text-[11px] text-purple-100 flex items-center space-x-1">
                    <Clock size={12} />
                    <span>Real-time Firestore Hits</span>
                  </p>
                </div>

                <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-100">Unique Visitors</span>
                    <Users className="w-5 h-5 text-blue-200" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ color: "#ffffff" }}>
                    {stats.uniqueVisitors.toLocaleString()}
                  </h3>
                  <p className="text-[11px] text-blue-100">Distinct Sessions Tracked</p>
                </div>

                <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">Download Data Transfer</span>
                    <ArrowDownRight className="w-5 h-5 text-emerald-200" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ color: "#ffffff" }}>
                    {formatMB(stats.totalDownloadBytes)}
                  </h3>
                  <p className="text-[11px] text-emerald-100">Estimated Visitor Download Payload</p>
                </div>

                <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-100">Upload Data Transfer</span>
                    <ArrowUpRight className="w-5 h-5 text-amber-200" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ color: "#ffffff" }}>
                    {formatMB(stats.totalUploadBytes)}
                  </h3>
                  <p className="text-[11px] text-amber-100">Estimated Visitor Request Data</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THEME & COLORS */}
          {activeTab === "theme" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-dark mb-1">Theme &amp; Colors</h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Customize the entire website theme, background colors, text colors, and button hover colors in real-time.
                </p>
              </div>
              <hr className="border-gray-200" />

              {/* Preset Tema Warna (5 Pilihan) */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      5 Preset Tema Warna
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pilih salah satu preset di bawah untuk menerapkan palet warna secara instan.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {themePresets.map((preset) => {
                    const isSelected =
                      formData.theme.primaryColor?.toLowerCase() === preset.theme.primaryColor.toLowerCase() &&
                      formData.theme.primaryHoverColor?.toLowerCase() === preset.theme.primaryHoverColor.toLowerCase() &&
                      formData.theme.darkBgColor?.toLowerCase() === preset.theme.darkBgColor.toLowerCase();

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, ...preset.theme },
                          });
                          setPresetAppliedMessage(`Tema "${preset.name}" berhasil diterapkan! Klik "Save All Changes" untuk menyimpan permanen.`);
                          setTimeout(() => setPresetAppliedMessage(""), 4500);
                        }}
                        className={`text-left p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between group relative overflow-hidden bg-white cursor-pointer ${
                          isSelected
                            ? "border-primary shadow-sm ring-2 ring-primary/20"
                            : "border-gray-200 hover:border-primary/50 hover:shadow-xs"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <div>
                          {/* Color Swatch Dots */}
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <span
                              className="w-5 h-5 rounded-full border border-black/10 shadow-xs flex-shrink-0"
                              style={{ backgroundColor: preset.theme.primaryColor }}
                              title={`Primary: ${preset.theme.primaryColor}`}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shadow-xs flex-shrink-0"
                              style={{ backgroundColor: preset.theme.primaryHoverColor }}
                              title={`Hover: ${preset.theme.primaryHoverColor}`}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shadow-xs flex-shrink-0"
                              style={{ backgroundColor: preset.theme.secondaryColor }}
                              title={`Secondary: ${preset.theme.secondaryColor}`}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shadow-xs flex-shrink-0"
                              style={{ backgroundColor: preset.theme.darkBgColor }}
                              title={`Dark BG: ${preset.theme.darkBgColor}`}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shadow-xs flex-shrink-0"
                              style={{ backgroundColor: preset.theme.lightBgColor }}
                              title={`Light BG: ${preset.theme.lightBgColor}`}
                            />
                          </div>
                          <div className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-primary transition-colors">
                            {preset.name}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                            {preset.description}
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-medium text-gray-600">
                          <span className="font-mono text-gray-400">{preset.theme.primaryColor}</span>
                          <span className={isSelected ? "text-primary font-bold" : "group-hover:text-primary"}>
                            {isSelected ? "Aktif" : "Pilih"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {presetAppliedMessage && (
                  <div className="mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span>{presetAppliedMessage}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.theme.primaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, primaryColor: e.target.value },
                        })
                      }
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-300 cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.theme.primaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, primaryColor: e.target.value },
                        })
                      }
                      placeholder="#6244C5"
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl font-mono text-xs sm:text-sm uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Primary Hover Color (Warna Hover Button)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.theme.primaryHoverColor || "#5034b0"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, primaryHoverColor: e.target.value },
                        })
                      }
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-300 cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.theme.primaryHoverColor || "#5034b0"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, primaryHoverColor: e.target.value },
                        })
                      }
                      placeholder="#5034B0"
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl font-mono text-xs sm:text-sm uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Secondary Accent Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.theme.secondaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, secondaryColor: e.target.value },
                        })
                      }
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-300 cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.theme.secondaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, secondaryColor: e.target.value },
                        })
                      }
                      placeholder="#FFC448"
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl font-mono text-xs sm:text-sm uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Heading Text Color (H1-H6)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.theme.headingColor || "#12141D"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, headingColor: e.target.value },
                        })
                      }
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-300 cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.theme.headingColor || "#12141D"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, headingColor: e.target.value },
                        })
                      }
                      placeholder="#12141D"
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl font-mono text-xs sm:text-sm uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Body Text Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.theme.textColor || "#12141D"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, textColor: e.target.value },
                        })
                      }
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-300 cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.theme.textColor || "#12141D"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, textColor: e.target.value },
                        })
                      }
                      placeholder="#12141D"
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl font-mono text-xs sm:text-sm uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Muted Subtitle Text Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.theme.mutedTextColor || "#6B7280"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, mutedTextColor: e.target.value },
                        })
                      }
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-300 cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.theme.mutedTextColor || "#6B7280"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, mutedTextColor: e.target.value },
                        })
                      }
                      placeholder="#6B7280"
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl font-mono text-xs sm:text-sm uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Button Text Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.theme.buttonTextColor || "#FFFFFF"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, buttonTextColor: e.target.value },
                        })
                      }
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-300 cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.theme.buttonTextColor || "#FFFFFF"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, buttonTextColor: e.target.value },
                        })
                      }
                      placeholder="#FFFFFF"
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl font-mono text-xs sm:text-sm uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Light Background Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.theme.lightBgColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, lightBgColor: e.target.value },
                        })
                      }
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-300 cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.theme.lightBgColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, lightBgColor: e.target.value },
                        })
                      }
                      placeholder="#FAFAFB"
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl font-mono text-xs sm:text-sm uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Dark Background Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.theme.darkBgColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, darkBgColor: e.target.value },
                        })
                      }
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-300 cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.theme.darkBgColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, darkBgColor: e.target.value },
                        })
                      }
                      placeholder="#12141D"
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl font-mono text-xs sm:text-sm uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: NAVIGATION MENU LABELS */}
          {activeTab === "nav" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-dark mb-1">Navigation Menu Labels</h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Customize the text for all menu navigation links displayed in the top navbar.
                </p>
              </div>
              <hr className="border-gray-200" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Brand Name Logo Text</label>
                  <input
                    type="text"
                    value={formData.nav?.brandText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nav: { ...formData.nav, brandText: e.target.value },
                      })
                    }
                    placeholder="e.g. MyBrand / Portfolio"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Home Link Text</label>
                  <input
                    type="text"
                    value={formData.nav?.homeText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nav: { ...formData.nav, homeText: e.target.value },
                      })
                    }
                    placeholder="e.g. Home"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">About Link Text</label>
                  <input
                    type="text"
                    value={formData.nav?.aboutText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nav: { ...formData.nav, aboutText: e.target.value },
                      })
                    }
                    placeholder="e.g. About"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Skills Link Text</label>
                  <input
                    type="text"
                    value={formData.nav?.skillsText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nav: { ...formData.nav, skillsText: e.target.value },
                      })
                    }
                    placeholder="e.g. Skills"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">What I Do / Services Link Text</label>
                  <input
                    type="text"
                    value={formData.nav?.servicesText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nav: { ...formData.nav, servicesText: e.target.value },
                      })
                    }
                    placeholder="e.g. What I Do (or Services)"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Projects Link Text</label>
                  <input
                    type="text"
                    value={formData.nav?.projectsText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nav: { ...formData.nav, projectsText: e.target.value },
                      })
                    }
                    placeholder="e.g. Projects"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Contact Link Text</label>
                  <input
                    type="text"
                    value={formData.nav?.contactText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nav: { ...formData.nav, contactText: e.target.value },
                      })
                    }
                    placeholder="e.g. Contact"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HERO & HEADER */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-dark mb-1">Header &amp; Hero Section</h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Edit all text elements in the header, candidate name, animated roles, CV button, and optional video button.
                </p>
              </div>
              <hr className="border-gray-200" />

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Header Prefix Text (e.g. &quot;I&apos;m&quot;)
                    </label>
                    <input
                      type="text"
                      value={formData.hero.imText || "I'm"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, imText: e.target.value },
                        })
                      }
                      placeholder="e.g. I'm or Hello, I am"
                      className="w-full px-3.5 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.hero.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, name: e.target.value },
                        })
                      }
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Animated Roles (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.hero.roles ? formData.hero.roles.join(", ") : ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: {
                          ...formData.hero,
                          roles: e.target.value.split(",").map((r) => r.trim()),
                        },
                      })
                    }
                    placeholder="Web Designer, Web Developer, Front End Developer"
                    className="w-full px-3.5 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Download CV Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.hero.cvText || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, cvText: e.target.value },
                        })
                      }
                      placeholder="e.g. Download CV"
                      className="w-full px-3.5 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Download CV Button Link
                    </label>
                    <input
                      type="text"
                      value={formData.hero.cvLink || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, cvLink: e.target.value },
                        })
                      }
                      placeholder="e.g. #contact or https://..."
                      className="w-full px-3.5 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-3 sm:space-y-4">
                  <h5 className="font-bold text-xs sm:text-sm text-primary">Play Video Button Settings (Optional)</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-gray-700 mb-1">
                        Play Video Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.hero.videoText || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, videoText: e.target.value },
                          })
                        }
                        placeholder="e.g. Play Video"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-gray-700 mb-1">
                        YouTube Video URL (Leave BLANK to hide button)
                      </label>
                      <input
                        type="text"
                        value={formData.hero.videoUrl || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, videoUrl: e.target.value },
                          })
                        }
                        placeholder="https://www.youtube.com/embed/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Profile Photo (Google Drive link or Image URL)
                    </label>
                    <input
                      type="text"
                      value={formData.hero.profileImg || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, profileImg: e.target.value },
                        })
                      }
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full px-3.5 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <DriveImagePreview
                    url={formData.hero.profileImg}
                    label="Profile Photo Preview"
                    aspectRatio="aspect-square max-w-[200px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT & STATS */}
          {activeTab === "about" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-dark mb-1">About Section &amp; Statistics</h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Update years of experience, bio text, bullet points, client/project counter titles, descriptions, and photos.
                </p>
              </div>
              <hr className="border-gray-200" />

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Years Count (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.about.years || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, years: e.target.value },
                        })
                      }
                      placeholder="e.g. 5 (leave blank to hide)"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Years Badge Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.about.yearsLabel || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, yearsLabel: e.target.value },
                        })
                      }
                      placeholder="e.g. Years (leave blank to hide)"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* About CTA Button Settings */}
                <div className="p-3.5 sm:p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs sm:text-sm text-primary">About Button Settings (Contact Me / Read More)</h5>
                    <span className="text-[11px] font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">Customizable</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Button Text (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.about.readMoreText || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            about: { ...formData.about, readMoreText: e.target.value },
                          })
                        }
                        placeholder="e.g. Contact Me / Read More"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm bg-white"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">Kosongkan jika ingin menyembunyikan tombol di bagian About.</p>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Button Hyperlink (Action URL)
                      </label>
                      <input
                        type="text"
                        value={formData.about.readMoreLink || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            about: { ...formData.about, readMoreLink: e.target.value },
                          })
                        }
                        placeholder="e.g. #contact, https://wa.me/628123456789, or https://..."
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm bg-white"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">Default: <code>#contact</code> jika dikosongkan. Bisa link WA, email, atau link eksternal.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Headline Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.about.subtitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about: { ...formData.about, subtitle: e.target.value },
                      })
                    }
                    placeholder="e.g. A passionate developer based in..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Bio Description Paragraph
                  </label>
                  <textarea
                    rows={4}
                    value={formData.about.description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about: { ...formData.about, description: e.target.value },
                      })
                    }
                    placeholder="Write your biography and background overview here..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Key Highlights (Comma separated - Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.about.points ? formData.about.points.join(", ") : ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about: {
                          ...formData.about,
                          points: e.target.value ? e.target.value.split(",").map((p) => p.trim()) : [],
                        },
                      })
                    }
                    placeholder="e.g. Affordable Prices, High Quality Product, On Time Delivery"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Kosongkan kolom ini jika tidak ingin menampilkan poin-poin checklist pada bagian About.</p>
                </div>

                {/* Happy Clients Stats Config */}
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs sm:text-sm text-dark">Happy Clients Card Settings (Opsional)</h5>
                    <span className="text-[11px] font-medium text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-200">Opsional</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Kosongkan semua isian kartu ini jika Anda tidak ingin menampilkan kartu Happy Clients di website.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Title</label>
                      <input
                        type="text"
                        value={formData.about.happyClientsTitle || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            about: { ...formData.about, happyClientsTitle: e.target.value },
                          })
                        }
                        placeholder="e.g. Happy Clients"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Counter Number</label>
                      <input
                        type="text"
                        value={formData.about.happyClientsCount || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            about: { ...formData.about, happyClientsCount: e.target.value },
                          })
                        }
                        placeholder="e.g. 1234"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={formData.about.happyClientsDesc || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, happyClientsDesc: e.target.value },
                        })
                      }
                      placeholder="e.g. Satisfied clients around the world..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                    />
                  </div>
                </div>

                {/* Projects Completed Stats Config */}
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs sm:text-sm text-dark">Projects Completed Card Settings (Opsional)</h5>
                    <span className="text-[11px] font-medium text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-200">Opsional</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Kosongkan semua isian kartu ini jika Anda tidak ingin menampilkan kartu Projects Completed di website.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Title</label>
                      <input
                        type="text"
                        value={formData.about.projectsCompletedTitle || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            about: { ...formData.about, projectsCompletedTitle: e.target.value },
                          })
                        }
                        placeholder="e.g. Projects Completed"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Counter Number</label>
                      <input
                        type="text"
                        value={formData.about.projectsCompletedCount || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            about: { ...formData.about, projectsCompletedCount: e.target.value },
                          })
                        }
                        placeholder="e.g. 50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={formData.about.projectsCompletedDesc || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, projectsCompletedDesc: e.target.value },
                        })
                      }
                      placeholder="e.g. Successfully finished projects..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      About Image 1 (Google Drive link)
                    </label>
                    <input
                      type="text"
                      value={formData.about.image1 || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, image1: e.target.value },
                        })
                      }
                      placeholder="https://drive.google.com/file/d/... or /img/about-1.jpg"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                    />
                    <DriveImagePreview
                      url={formData.about.image1}
                      label="About Image 1 Preview"
                      aspectRatio="aspect-[4/3]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      About Image 2 (Google Drive link)
                    </label>
                    <input
                      type="text"
                      value={formData.about.image2 || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, image2: e.target.value },
                        })
                      }
                      placeholder="https://drive.google.com/file/d/... or /img/about-2.jpg"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                    />
                    <DriveImagePreview
                      url={formData.about.image2}
                      label="About Image 2 Preview"
                      aspectRatio="aspect-[4/3]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS & TIMELINE */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-dark mb-1">Skills &amp; Timelines</h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Edit section title, description text, technical skills bars, and work experience / education items.
                </p>
              </div>
              <hr className="border-gray-200" />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={formData.skills.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        skills: { ...formData.skills, title: e.target.value },
                      })
                    }
                    placeholder="e.g. Skills & Experience"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Section Description Text
                  </label>
                  <textarea
                    rows={3}
                    value={formData.skills.description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        skills: { ...formData.skills, description: e.target.value },
                      })
                    }
                    placeholder="Description text about your skills and timeline..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Skills Subtitle (&quot;My Skills&quot;)
                  </label>
                  <input
                    type="text"
                    value={formData.skills.mySkillsTitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        skills: { ...formData.skills, mySkillsTitle: e.target.value },
                      })
                    }
                    placeholder="e.g. My Skills"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Skills Progress List */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base sm:text-lg font-bold text-dark">Technical Skill Bars</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newSkill: SkillItem = {
                        id: Date.now().toString(),
                        name: "",
                        value: 80,
                        color: formData.theme?.primaryColor || "#6244C5",
                      };
                      setFormData({
                        ...formData,
                        skills: {
                          ...formData.skills,
                          skillsList: [newSkill, ...(formData.skills.skillsList || [])],
                        },
                      });
                    }}
                    className="px-3 py-1.5 bg-primary text-white rounded-lg font-semibold text-xs flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add Skill</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.skills.skillsList?.map((skill, index) => (
                    <div
                      key={skill.id || index}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <input
                        type="text"
                        value={skill.name || ""}
                        onChange={(e) => {
                          const updated = [...formData.skills.skillsList];
                          updated[index].name = e.target.value;
                          setFormData({
                            ...formData,
                            skills: { ...formData.skills, skillsList: updated },
                          });
                        }}
                        placeholder="Skill Name, e.g. React.js"
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm flex-1"
                      />
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={skill.value || 0}
                          onChange={(e) => {
                            const updated = [...formData.skills.skillsList];
                            updated[index].value = parseInt(e.target.value) || 0;
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, skillsList: updated },
                            });
                          }}
                          placeholder="80"
                          className="w-16 sm:w-20 px-2 sm:px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm text-center"
                        />
                        <input
                          type="color"
                          value={skill.color || "#6244C5"}
                          onChange={(e) => {
                            const updated = [...formData.skills.skillsList];
                            updated[index].color = e.target.value;
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, skillsList: updated },
                            });
                          }}
                          className="w-8 h-8 rounded border border-gray-300 cursor-pointer flex-shrink-0"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.skills.skillsList.filter((_, i) => i !== index);
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, skillsList: updated },
                            });
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base sm:text-lg font-bold text-dark">Work Experience Items</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newExp: TimelineItem = {
                        id: Date.now().toString(),
                        title: "",
                        period: "",
                        company: "",
                      };
                      setFormData({
                        ...formData,
                        skills: {
                          ...formData.skills,
                          experiences: [newExp, ...(formData.skills.experiences || [])],
                        },
                      });
                    }}
                    className="px-3 py-1.5 bg-primary text-white rounded-lg font-semibold text-xs flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add Experience</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.skills.experiences?.map((exp, index) => (
                    <div key={exp.id || index} className="p-3 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <input
                        type="text"
                        value={exp.title || ""}
                        onChange={(e) => {
                          const updated = [...formData.skills.experiences];
                          updated[index].title = e.target.value;
                          setFormData({
                            ...formData,
                            skills: { ...formData.skills, experiences: updated },
                          });
                        }}
                        placeholder="Job Title, e.g. Senior Frontend Developer"
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm"
                      />
                      <input
                        type="text"
                        value={exp.period || ""}
                        onChange={(e) => {
                          const updated = [...formData.skills.experiences];
                          updated[index].period = e.target.value;
                          setFormData({
                            ...formData,
                            skills: { ...formData.skills, experiences: updated },
                          });
                        }}
                        placeholder="Period (e.g. 2022 - Present)"
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={exp.company || ""}
                          onChange={(e) => {
                            const updated = [...formData.skills.experiences];
                            updated[index].company = e.target.value;
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, experiences: updated },
                            });
                          }}
                          placeholder="Company Name, e.g. Google"
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.skills.experiences.filter((_, i) => i !== index);
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, experiences: updated },
                            });
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Items */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base sm:text-lg font-bold text-dark">Education Items</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newEdu: TimelineItem = {
                        id: Date.now().toString(),
                        title: "",
                        period: "",
                        company: "",
                      };
                      setFormData({
                        ...formData,
                        skills: {
                          ...formData.skills,
                          educations: [newEdu, ...(formData.skills.educations || [])],
                        },
                      });
                    }}
                    className="px-3 py-1.5 bg-primary text-white rounded-lg font-semibold text-xs flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add Education</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.skills.educations?.map((edu, index) => (
                    <div key={edu.id || index} className="p-3 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <input
                        type="text"
                        value={edu.title || ""}
                        onChange={(e) => {
                          const updated = [...formData.skills.educations];
                          updated[index].title = e.target.value;
                          setFormData({
                            ...formData,
                            skills: { ...formData.skills, educations: updated },
                          });
                        }}
                        placeholder="Degree / Field of Study (e.g. B.S. Computer Science)"
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm"
                      />
                      <input
                        type="text"
                        value={edu.period || ""}
                        onChange={(e) => {
                          const updated = [...formData.skills.educations];
                          updated[index].period = e.target.value;
                          setFormData({
                            ...formData,
                            skills: { ...formData.skills, educations: updated },
                          });
                        }}
                        placeholder="Period (e.g. 2018 - 2022)"
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={edu.company || ""}
                          onChange={(e) => {
                            const updated = [...formData.skills.educations];
                            updated[index].company = e.target.value;
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, educations: updated },
                            });
                          }}
                          placeholder="School / University Name, e.g. Stanford University"
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.skills.educations.filter((_, i) => i !== index);
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, educations: updated },
                            });
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WHAT I DO (SERVICES) */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-dark mb-1">What I Do</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Manage What I Do section title, description text, Hire Me button text, and service cards.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newService: ServiceItem = {
                      id: Date.now().toString(),
                      title: "",
                      price: "",
                      description: "",
                      iconName: "Code",
                    };
                    setFormData({
                      ...formData,
                      services: {
                        ...formData.services,
                        items: [newService, ...(formData.services.items || [])],
                      },
                    });
                  }}
                  className="px-3.5 py-2 bg-primary text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-1 self-start sm:self-auto"
                >
                  <Plus size={16} />
                  <span>Add Service</span>
                </button>
              </div>
              <hr className="border-gray-200" />

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Section Title</label>
                    <input
                      type="text"
                      value={formData.services.title || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          services: { ...formData.services, title: e.target.value },
                        })
                      }
                      placeholder="e.g. What I Do"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Hire Me Button Text</label>
                    <input
                      type="text"
                      value={formData.services.hireMeText || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          services: { ...formData.services, hireMeText: e.target.value },
                        })
                      }
                      placeholder="e.g. Hire Me"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Section Description Text</label>
                  <textarea
                    rows={2}
                    value={formData.services.description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        services: { ...formData.services, description: e.target.value },
                      })
                    }
                    placeholder="e.g. I provide a wide range of web development and design services..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h4 className="text-base sm:text-lg font-bold text-dark">Service Cards</h4>
                  {formData.services.items?.map((service, index) => (
                    <div key={service.id || index} className="p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-primary">Service #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.services.items.filter((_, i) => i !== index);
                            setFormData({
                              ...formData,
                              services: { ...formData.services, items: updated },
                            });
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={service.title}
                            onChange={(e) => {
                              const updated = [...formData.services.items];
                              updated[index].title = e.target.value;
                              setFormData({
                                ...formData,
                                services: { ...formData.services, items: updated },
                              });
                            }}
                            placeholder="Service title, e.g. Web Design"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Price Label (Optional)</label>
                          <input
                            type="text"
                            value={service.price}
                            onChange={(e) => {
                              const updated = [...formData.services.items];
                              updated[index].price = e.target.value;
                              setFormData({
                                ...formData,
                                services: { ...formData.services, items: updated },
                              });
                            }}
                            placeholder="e.g. $199 (leave blank to hide price)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Icon Type</label>
                          <select
                            value={service.iconName}
                            onChange={(e) => {
                              const updated = [...formData.services.items];
                              updated[index].iconName = e.target.value;
                              setFormData({
                                ...formData,
                                services: { ...formData.services, items: updated },
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                          >
                            <option value="Crop">Crop</option>
                            <option value="GitBranch">GitBranch</option>
                            <option value="Code">Code</option>
                            <option value="Laptop">Laptop</option>
                            <option value="Layout">Layout</option>
                            <option value="Sparkles">Sparkles</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={service.description}
                          onChange={(e) => {
                            const updated = [...formData.services.items];
                            updated[index].description = e.target.value;
                            setFormData({
                              ...formData,
                              services: { ...formData.services, items: updated },
                            });
                          }}
                          placeholder="Service description text goes here..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-dark mb-1">Projects Portfolio</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Manage project section titles, descriptions, project cards, popup modal details, and Google Drive photos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newProj: ProjectItem = {
                      id: Date.now().toString(),
                      title: "",
                      category: "first",
                      categoryLabel: "",
                      image: "",
                      description: "",
                      client: "",
                      date: "",
                      link: "",
                    };
                    setFormData({
                      ...formData,
                      projects: {
                        ...formData.projects,
                        items: [newProj, ...(formData.projects.items || [])],
                      },
                    });
                  }}
                  className="px-3.5 py-2 bg-primary text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-1 self-start sm:self-auto"
                >
                  <Plus size={16} />
                  <span>Add Project</span>
                </button>
              </div>
              <hr className="border-gray-200" />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={formData.projects.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projects: { ...formData.projects, title: e.target.value },
                      })
                    }
                    placeholder="e.g. My Projects"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Section Description Text</label>
                  <textarea
                    rows={2}
                    value={formData.projects.description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projects: { ...formData.projects, description: e.target.value },
                      })
                    }
                    placeholder="e.g. Check out some of my featured and recent work..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h4 className="text-base sm:text-lg font-bold text-dark">Portfolio Project Cards &amp; Popup Details</h4>
                  {formData.projects.items?.map((proj, index) => (
                    <div key={proj.id || index} className="p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-primary">Project #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.projects.items.filter((_, i) => i !== index);
                            setFormData({
                              ...formData,
                              projects: { ...formData.projects, items: updated },
                            });
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => {
                              const updated = [...formData.projects.items];
                              updated[index].title = e.target.value;
                              setFormData({
                                ...formData,
                                projects: { ...formData.projects, items: updated },
                              });
                            }}
                            placeholder="Project title, e.g. E-Commerce Platform"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Category Label</label>
                          <input
                            type="text"
                            value={proj.categoryLabel}
                            onChange={(e) => {
                              const updated = [...formData.projects.items];
                              updated[index].categoryLabel = e.target.value;
                              setFormData({
                                ...formData,
                                projects: { ...formData.projects, items: updated },
                              });
                            }}
                            placeholder="Category, e.g. UI/UX Design or Web App"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Photo Link (Google Drive)</label>
                        <input
                          type="text"
                          value={proj.image || ""}
                          onChange={(e) => {
                            const updated = [...formData.projects.items];
                            updated[index].image = e.target.value;
                            setFormData({
                              ...formData,
                              projects: { ...formData.projects, items: updated },
                            });
                          }}
                          placeholder="https://drive.google.com/file/d/... or /img/project-1.jpg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                        />
                        <DriveImagePreview
                          url={proj.image}
                          label={`Project #${index + 1} Image Preview`}
                          aspectRatio="aspect-video"
                        />
                      </div>

                      {/* Extended Popup Modal Details Fields */}
                      <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-3">
                        <p className="text-[11px] sm:text-xs font-bold text-primary">Popup Modal Details</p>
                        <div>
                          <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Detailed Explanation Text</label>
                          <textarea
                            rows={3}
                            value={proj.description || ""}
                            onChange={(e) => {
                              const updated = [...formData.projects.items];
                              updated[index].description = e.target.value;
                              setFormData({
                                ...formData,
                                projects: { ...formData.projects, items: updated },
                              });
                            }}
                            placeholder="Detailed overview shown when user clicks the project card..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Client Name</label>
                            <input
                              type="text"
                              value={proj.client || ""}
                              onChange={(e) => {
                                const updated = [...formData.projects.items];
                                updated[index].client = e.target.value;
                                setFormData({
                                  ...formData,
                                  projects: { ...formData.projects, items: updated },
                                });
                              }}
                              placeholder="e.g. Apex Corp"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Date / Year</label>
                            <input
                              type="text"
                              value={proj.date || ""}
                              onChange={(e) => {
                                const updated = [...formData.projects.items];
                                updated[index].date = e.target.value;
                                setFormData({
                                  ...formData,
                                  projects: { ...formData.projects, items: updated },
                                });
                              }}
                              placeholder="e.g. 2024"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Live Project Link</label>
                            <input
                              type="text"
                              value={proj.link || ""}
                              onChange={(e) => {
                                const updated = [...formData.projects.items];
                                updated[index].link = e.target.value;
                                setFormData({
                                  ...formData,
                                  projects: { ...formData.projects, items: updated },
                                });
                              }}
                              placeholder="https://example.com"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CONTACT & SOCIALS */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-dark mb-1">Contact, Formspree &amp; Social Links</h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Update contact section title, description, button text, office info, Formspree endpoint URL, and social media links.
                  <span className="block mt-1 font-semibold text-primary">* Note: Office, Phone, and Email are OPTIONAL. Empty fields will be hidden automatically.</span>
                </p>
              </div>
              <hr className="border-gray-200" />

              <div className="space-y-4">
                <div className="p-3.5 sm:p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-3">
                  <h5 className="font-bold text-xs sm:text-sm text-primary">Formspree Email Endpoint Integration</h5>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-gray-700 mb-1">
                      Formspree Endpoint URL (e.g. https://formspree.io/f/your_form_id)
                    </label>
                    <input
                      type="text"
                      value={formData.contact.formspreeUrl || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, formspreeUrl: e.target.value },
                        })
                      }
                      placeholder="https://formspree.io/f/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={formData.contact.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, title: e.target.value },
                      })
                    }
                    placeholder="e.g. Let's Work Together"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Description Paragraph</label>
                  <textarea
                    rows={3}
                    value={formData.contact.description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, description: e.target.value },
                      })
                    }
                    placeholder="Feel free to reach out for collaborations, inquiries, or questions..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Office Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.contact.office}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, office: e.target.value },
                        })
                      }
                      placeholder="123 Street, New York, USA"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.contact.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, phone: e.target.value },
                        })
                      }
                      placeholder="+012 345 6789"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, email: e.target.value },
                        })
                      }
                      placeholder="info@example.com"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-base sm:text-lg font-bold text-dark mb-4">Social Media Profile Links</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Instagram Link</label>
                      <input
                        type="text"
                        value={formData.contact.instagramUrl || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: { ...formData.contact, instagramUrl: e.target.value },
                          })
                        }
                        placeholder="https://instagram.com/yourusername"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Twitter Link</label>
                      <input
                        type="text"
                        value={formData.contact.twitterUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: { ...formData.contact, twitterUrl: e.target.value },
                          })
                        }
                        placeholder="https://twitter.com/yourusername"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">Facebook Link</label>
                      <input
                        type="text"
                        value={formData.contact.facebookUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: { ...formData.contact, facebookUrl: e.target.value },
                          })
                        }
                        placeholder="https://facebook.com/yourusername"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">YouTube Link</label>
                      <input
                        type="text"
                        value={formData.contact.youtubeUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: { ...formData.contact, youtubeUrl: e.target.value },
                          })
                        }
                        placeholder="https://youtube.com/@yourchannel"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">LinkedIn Link</label>
                      <input
                        type="text"
                        value={formData.contact.linkedinUrl || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: { ...formData.contact, linkedinUrl: e.target.value },
                          })
                        }
                        placeholder="https://linkedin.com/in/yourusername"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-gray-600 mb-1">GitHub Link</label>
                      <input
                        type="text"
                        value={formData.contact.githubUrl || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: { ...formData.contact, githubUrl: e.target.value },
                          })
                        }
                        placeholder="https://github.com/yourusername"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: FOOTER */}
          {activeTab === "footer" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-dark mb-1">Footer &amp; Copyright</h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Update site brand name and copyright notice.
                </p>
              </div>
              <hr className="border-gray-200" />

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Site Brand Name</label>
                    <input
                      type="text"
                      value={formData.footer.siteName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, siteName: e.target.value },
                        })
                      }
                      placeholder="e.g. STENLY or My Portfolio"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Copyright Notice Text</label>
                    <input
                      type="text"
                      value={formData.footer.copyrightText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, copyrightText: e.target.value },
                        })
                      }
                      placeholder="e.g. All Rights Reserved."
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Attribution / Credits (Permanen &amp; Dikunci):</span>
                  <p className="mt-1 text-gray-500">
                    Designed By <span className="text-secondary font-semibold">HTML Codex</span> Distributed By: <span className="text-secondary font-semibold">ThemeWagon</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Teks dan tautan kredit di footer kanan bawah telah dikunci secara permanen dan tidak dapat diubah.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: ACCOUNT & PASSWORD SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-dark mb-1">Account &amp; Password Settings</h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Update your Firebase Auth Admin account password.
                </p>
              </div>
              <hr className="border-gray-200" />

              {passwordStatusMessage && (
                <div
                  className={`p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm flex items-center space-x-3 ${
                    passwordStatusMessage.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border border-rose-200 text-rose-700"
                  }`}
                >
                  {passwordStatusMessage.type === "success" ? (
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle size={18} className="text-rose-500 flex-shrink-0" />
                  )}
                  <span>{passwordStatusMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-5 max-w-lg">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    New Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-xs sm:text-sm text-dark"
                    />
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3.5 top-3 sm:top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3 sm:top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label="Toggle New Password Visibility"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-xs sm:text-sm text-dark"
                    />
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3.5 top-3 sm:top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3 sm:top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label="Toggle Confirm Password Visibility"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-primary text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-primary-hover transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isUpdatingPassword ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>

              {/* Data Management: Database JSON Backup & Restore */}
              <div className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border border-indigo-200/80 rounded-2xl space-y-4 mt-8">
                <div className="flex items-center space-x-2.5 text-indigo-900">
                  <Database className="w-5 h-5 text-primary flex-shrink-0" />
                  <h4 className="text-base sm:text-lg font-bold">Database Backup &amp; Restore (JSON)</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Ekspor seluruh data portofolio dari Firestore ke dalam file <strong>database.json</strong> untuk backup lokal, atau impor/unggah file <strong>database.json</strong> untuk memperbarui database secara instan dengan sinkronisasi real-time.
                </p>

                {dbStatusMessage && (
                  <div
                    className={`p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm flex items-center space-x-3 animate-fade-in-up ${
                      dbStatusMessage.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border border-rose-200 text-rose-700"
                    }`}
                  >
                    {dbStatusMessage.type === "success" ? (
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="text-rose-500 flex-shrink-0" />
                    )}
                    <span>{dbStatusMessage.text}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {/* Download database.json button */}
                  <button
                    type="button"
                    onClick={handleDownloadDatabase}
                    disabled={isDownloadingJson || isSaving}
                    className="px-4 py-2.5 sm:px-5 sm:py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isDownloadingJson ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Mendownload JSON...</span>
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        <span>Download database.json</span>
                      </>
                    )}
                  </button>

                  {/* Upload / Import database.json button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="admin-database-upload-input"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImportingJson || isSaving}
                    className="px-4 py-2.5 sm:px-5 sm:py-2.5 bg-white hover:bg-gray-50 text-indigo-700 border border-indigo-300 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isImportingJson ? (
                      <>
                        <RefreshCw size={16} className="animate-spin text-primary" />
                        <span>Mengimpor JSON...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Import / Upload database.json</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Data Management: Clear All Sample Data */}
              <div className="p-4 sm:p-6 bg-rose-50/50 border border-rose-200 rounded-2xl space-y-3 mt-6">
                <div className="flex items-center space-x-2.5 text-rose-700">
                  <Trash2 className="w-5 h-5 flex-shrink-0" />
                  <h4 className="text-base sm:text-lg font-bold">Hapus Seluruh Teks &amp; Gambar Contoh</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Tombol ini akan menghapus seluruh data contoh/bawaan dari database hosting Firebase dan cache browser Anda. Website akan menjadi bersih 100% sehingga Anda dapat mengisinya dengan profil &amp; proyek asli Anda.
                </p>
                <button
                  type="button"
                  onClick={handleClearAllSampleData}
                  disabled={isClearing || isSaving}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {isClearing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Menghapus Data Contoh...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Hapus Seluruh Data Contoh dari Hosting</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
