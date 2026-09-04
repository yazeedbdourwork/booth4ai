"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { Search, Copy, Check, Sparkles, Flame, Clock, Heart, Eye } from "lucide-react";

export interface PromptItem {
  id: string;
  title?: string;
  prompt: string;
  model: string;
  category?: string;
  image_url: string;
  likes_count?: number;
}

const CATEGORIES = [
  "All",
  "Midjourney",
  "FLUX.1",
  "Stable Diffusion",
  "DALL-E 3",
  "Photorealistic",
  "Anime & Manga",
  "Logos & Icons",
  "3D & Renders",
  "Architecture",
];

export default function Home() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [activeSort, setActiveSort] = useState<"trending" | "newest">("trending");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrompts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("prompts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setPrompts(data as PromptItem[]);
      } catch (err) {
        console.error("Failed to load prompts from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPrompts();
  }, []);

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPrompts = useMemo(() => {
    return prompts.filter((item) => {
      const matchesSearch =
        item.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        item.model?.toLowerCase().includes(activeTab.toLowerCase()) ||
        item.category?.toLowerCase().includes(activeTab.toLowerCase());

      return matchesSearch && matchesTab;
    });
  }, [prompts, searchQuery, activeTab]);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-zinc-100 selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#0b0f17]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1700px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
              <Sparkles className="h-6 w-6 text-indigo-500" />
              <span>Booth4<span className="text-indigo-500">AI</span></span>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-400 md:flex">
              <button
                onClick={() => setActiveSort("trending")}
                className={`flex items-center gap-1.5 transition ${activeSort === "trending" ? "text-white" : "hover:text-zinc-200"}`}
              >
                <Flame className="h-4 w-4 text-orange-400" />
                Trending
              </button>
              <button
                onClick={() => setActiveSort("newest")}
                className={`flex items-center gap-1.5 transition ${activeSort === "newest" ? "text-white" : "hover:text-zinc-200"}`}
              >
                <Clock className="h-4 w-4 text-indigo-400" />
                Newest
              </button>
            </nav>
          </div>

          {/* Center Search Input */}
          <div className="relative mx-4 max-w-lg flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search millions of prompts for Midjourney, FLUX, SDXL..."
              className="w-full rounded-full border border-zinc-800 bg-zinc-900/90 py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500">
              Submit Prompt
            </button>
          </div>
        </div>

        {/* Subheader: Category Pill Bar */}
        <div className="border-t border-zinc-800/50 bg-[#0c101a]/70 px-4 py-2 sm:px-6">
          <div className="mx-auto flex max-w-[1700px] gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-medium transition ${
                  activeTab === cat
                    ? "bg-white text-black shadow"
                    : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1700px] px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-zinc-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            <p className="text-sm">Loading prompts from database...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center text-zinc-500">
            <Sparkles className="mb-2 h-10 w-10 opacity-40" />
            <p className="text-base font-medium text-zinc-400">No prompts found</p>
            <p className="text-xs text-zinc-500">Try adjusting your filters or search keywords</p>
          </div>
        ) : (
          <div className="masonry-grid">
            {filteredPrompts.map((item) => (
              <div
                key={item.id}
                className="masonry-item group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                {/* Image */}
                <img
                  src={item.image_url}
                  alt={item.prompt}
                  loading="lazy"
                  className="w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />

                {/* Model Badge */}
                <div className="absolute left-3 top-3 z-10">
                  <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-200 backdrop-blur-md">
                    {item.model}
                  </span>
                </div>

                {/* Hover Overlay with Prompt and Copy Action */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <p className="line-clamp-3 text-xs leading-relaxed text-zinc-200">
                    {item.prompt}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2">
                    <span className="text-[11px] text-zinc-400">
                      {item.category || "General"}
                    </span>

                    <button
                      onClick={(e) => handleCopy(item.id, item.prompt, e)}
                      className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Prompt</span>
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
    </div>
  );
}
