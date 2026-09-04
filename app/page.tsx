"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import {
  Search,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  X,
  Download,
  User as UserIcon,
  LogOut,
  Mail,
  Lock,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

export interface PromptItem {
  id: string;
  title?: string;
  prompt: string;
  negative_prompt?: string;
  model: string;
  category?: string;
  image_url: string;
  aspect_ratio?: string;
  cfg_scale?: number;
  seed?: string;
  likes_count?: number;
  author_name?: string;
}

const NAV_CATEGORIES = [
  "Featured",
  "Hot",
  "New",
  "Top",
  "Video",
  "ChatGPT Image",
  "Midjourney",
  "Nano Banana",
  "Veo",
  "FLUX",
  "Sora",
  "Stable Diffusion",
  "Photography",
  "Anime",
  "Fashion",
  "Architecture",
];

const SEARCH_MODELS = [
  "Midjourney",
  "Seedance",
  "Nano Banana",
  "FLUX",
  "Stable Diffusion",
];

export default function Prompt4aiHomePage() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("Featured");
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalCopied, setModalCopied] = useState<boolean>(false);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch prompts
    async function loadData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("prompts")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setPrompts(data as PromptItem[]);
        }
      } catch (err) {
        console.error("Error querying prompts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // 2. Check current Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    // 3. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCopy = (id: string, text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyModal = (text: string) => {
    navigator.clipboard.writeText(text);
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 1800);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      }
      setShowAuthModal(false);
      setAuthEmail("");
      setAuthPassword("");
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        activeCategory === "Featured" ||
        activeCategory === "Hot" ||
        activeCategory === "New" ||
        p.model?.toLowerCase().includes(activeCategory.toLowerCase()) ||
        p.category?.toLowerCase().includes(activeCategory.toLowerCase());

      return matchSearch && matchCategory;
    });
  }, [prompts, searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-rose-500 selection:text-white">
      {/* 1. TOP WHITE HEADER */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1720px] items-center justify-between px-4 sm:px-6">
          {/* Brand & Left Navigation */}
          <div className="flex items-center gap-7">
            <a href="/" className="text-[22px] font-black tracking-tighter text-black">
              prompt<span className="font-extrabold text-zinc-800">4ai</span>
            </a>

            <nav className="hidden items-center gap-5 text-[13px] font-semibold text-zinc-600 lg:flex">
              <a href="#create" className="flex items-center gap-1 hover:text-black">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Create</span>
              </a>
              <div className="flex cursor-pointer items-center gap-0.5 hover:text-black">
                <span>Tools</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </div>
              <div className="flex cursor-pointer items-center gap-0.5 hover:text-black">
                <span>Academy</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </div>
              <a href="#pricing" className="hover:text-black">
                Pricing
              </a>
              <a href="#community" className="hover:text-black">
                Community
              </a>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <a
              href="#generate"
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
            >
              <span>Turn words and images into 3D models</span>
              <span className="text-sm">🎨</span>
            </a>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-semibold text-zinc-700 sm:inline">
                  {currentUser.email?.split("@")[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthError(null);
                  setShowAuthModal(true);
                }}
                className="rounded-lg bg-black px-4 py-1.5 text-xs font-bold text-white transition hover:bg-zinc-800"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Submenu Bar */}
        <div className="border-t border-zinc-100 bg-white px-4 py-2 sm:px-6">
          <div className="mx-auto flex max-w-[1720px] gap-6 overflow-x-auto no-scrollbar text-xs font-medium text-zinc-500">
            {NAV_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap pb-0.5 transition ${
                  activeCategory === cat
                    ? "font-bold text-black border-b-2 border-black"
                    : "hover:text-black"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. HERO BANNER WITH ARTISTIC BACKGROUND */}
      <section className="relative flex min-h-[460px] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#3a2016] via-[#1a0f0d] to-[#0d0908] px-4 py-16 text-center text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(234,88,12,0.35),transparent_70%)]" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            prompt4ai
          </h1>
          <p className="mt-2 text-lg font-medium text-orange-100/90 sm:text-xl">
            The #1 website for prompt engineering
          </p>
          <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-zinc-300 sm:text-sm">
            Search millions of AI prompts for Midjourney, Stable Diffusion, Sora,
            and every leading generative model. Discover hand-picked inspiration
            from the prompt4ai community.
          </p>

          {/* Centered Search Input */}
          <div className="mt-8 flex w-full items-center rounded-full bg-white p-1.5 shadow-2xl">
            <Search className="ml-3.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for prompts, models, or inspiration..."
              className="w-full bg-transparent px-3 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none sm:text-sm"
            />
            <button
              onClick={() => {}}
              className="rounded-full bg-black px-6 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800"
            >
              Search
            </button>
          </div>

          {/* Model Tags */}
          <div className="mt-6 flex flex-col items-center gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Search by model
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {SEARCH_MODELS.map((model) => (
                <button
                  key={model}
                  onClick={() => setSearchQuery(model)}
                  className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium text-zinc-200 backdrop-blur-md transition hover:bg-white/25 hover:text-white"
                >
                  {model}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. AS SEEN IN PRESS LOGO STRIP */}
      <section className="border-y border-zinc-200 bg-white py-4">
        <div className="mx-auto flex max-w-[1720px] flex-wrap items-center justify-between gap-6 px-4 text-zinc-400 sm:px-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            As seen in
          </span>
          <div className="flex flex-wrap items-center gap-8 text-xs font-serif font-bold tracking-tight text-zinc-700 sm:gap-12">
            <span>The New York Times</span>
            <span>The Washington Post</span>
            <span className="font-sans font-black tracking-tighter">BUSINESS INSIDER</span>
            <span className="font-sans font-bold">ABC</span>
            <span className="font-sans font-black text-red-600">POLITICO</span>
            <span className="font-sans font-black text-emerald-600">TC</span>
            <span className="font-sans font-bold">FAST COMPANY</span>
          </div>
        </div>
      </section>

      {/* 4. FEED GRID */}
      <main className="mx-auto max-w-[1850px] px-2 py-4 sm:px-4">
        {loading ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 text-zinc-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
            <p className="text-xs">Loading library...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center text-zinc-400">
            <Sparkles className="mb-2 h-8 w-8 text-zinc-300" />
            <p className="text-sm font-semibold text-zinc-700">No prompts found</p>
            <p className="text-xs text-zinc-400">Try searching for different models or terms</p>
          </div>
        ) : (
          <div className="columns-1 gap-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6">
            {filteredPrompts.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPrompt(item)}
                className="group relative mb-2 cursor-pointer break-inside-avoid overflow-hidden rounded-md bg-zinc-100 transition duration-200 hover:shadow-lg"
              >
                <img
                  src={item.image_url}
                  alt={item.prompt}
                  loading="lazy"
                  className="w-full object-cover transition duration-300 group-hover:brightness-95"
                />

                <div className="absolute left-2.5 top-2.5">
                  <span className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    {item.model}
                  </span>
                </div>

                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <p className="line-clamp-2 text-[11px] font-normal leading-snug text-white">
                    {item.prompt}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2">
                    <span className="text-[10px] font-medium text-zinc-300">
                      {item.category || "AI Art"}
                    </span>

                    <button
                      onClick={(e) => handleCopy(item.id, item.prompt, e)}
                      className="flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md transition hover:bg-white/30"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 5. PROMPT DETAILS MODAL */}
      {selectedPrompt && (
        <div
          onClick={() => setSelectedPrompt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white text-zinc-900 shadow-2xl md:flex-row"
          >
            <button
              onClick={() => setSelectedPrompt(null)}
              className="absolute right-3.5 top-3.5 z-20 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-1 items-center justify-center bg-zinc-950 p-4">
              <img
                src={selectedPrompt.image_url}
                alt={selectedPrompt.prompt}
                className="max-h-[70vh] w-auto rounded object-contain"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6 text-xs">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-700">
                    {selectedPrompt.model}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400">
                    {selectedPrompt.category || "AI Generation"}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    <span>Prompt</span>
                    <button
                      onClick={() => handleCopyModal(selectedPrompt.prompt)}
                      className="flex items-center gap-1 font-semibold text-black hover:text-zinc-600"
                    >
                      {modalCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{modalCopied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="mt-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-800">
                    {selectedPrompt.prompt}
                  </p>
                </div>

                {selectedPrompt.negative_prompt && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      Negative Prompt
                    </span>
                    <p className="mt-1 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-600">
                      {selectedPrompt.negative_prompt}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <div>
                    <span className="text-[10px] text-zinc-400">Aspect Ratio</span>
                    <p className="font-semibold text-zinc-700">{selectedPrompt.aspect_ratio || "1:1"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400">CFG Scale</span>
                    <p className="font-semibold text-zinc-700">{selectedPrompt.cfg_scale || "7"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400">Seed</span>
                    <p className="font-semibold text-zinc-700">{selectedPrompt.seed || "Random"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400">Author</span>
                    <p className="font-semibold text-zinc-700">{selectedPrompt.author_name || "Community"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-zinc-200 pt-4">
                <button
                  onClick={() => handleCopyModal(selectedPrompt.prompt)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{modalCopied ? "Copied" : "Copy Full Prompt"}</span>
                </button>
                <a
                  href={selectedPrompt.image_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-zinc-700 transition hover:bg-zinc-100"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SIGN IN / AUTHENTICATION MODAL */}
      {showAuthModal && (
        <div
          onClick={() => setShowAuthModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all"
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 text-center">
              <h3 className="text-xl font-black text-black">
                {authMode === "signin" ? "Welcome back" : "Create your account"}
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                {authMode === "signin"
                  ? "Sign in to save prompts and access Pro features"
                  : "Join the prompt4ai community to submit and explore prompts"}
              </p>
            </div>

            {authError && (
              <div className="mb-4 rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-zinc-200 py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-zinc-200 py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="mt-2 flex w-full items-center justify-center rounded-lg bg-black py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50"
              >
                {authLoading
                  ? "Processing..."
                  : authMode === "signin"
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-zinc-500">
              {authMode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setAuthError(null);
                      setAuthMode("signup");
                    }}
                    className="font-bold text-black hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setAuthError(null);
                      setAuthMode("signin");
                    }}
                    className="font-bold text-black hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
