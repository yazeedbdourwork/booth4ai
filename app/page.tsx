"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import {
  Search,
  Copy,
  Check,
  Sparkles,
  Flame,
  Clock,
  Heart,
  X,
  Download,
  Share2,
  ExternalLink,
  Layers,
  Sliders,
} from "lucide-react";

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

const MODELS = ["All", "Midjourney", "FLUX.1", "Stable Diffusion", "DALL-E 3"];
const CATEGORIES = [
  "All",
  "Photorealistic",
  "Portraits",
  "Anime & Manga",
  "Cinematic",
  "Logos & Icons",
  "Architecture",
  "Concept Art",
  "Fashion",
  "Cyberpunk",
];

export default function PromptHeroClone() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedModal, setCopiedModal] = useState<boolean>(false);

  useEffect(() => {
    async function fetchPrompts() {
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
        console.error("Failed to load prompts from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPrompts();
  }, []);

  const handleCopy = (id: string, text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyModal = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedModal(true);
    setTimeout(() => setCopiedModal(false), 2000);
  };

  const filteredPrompts = useMemo(() => {
    return prompts.filter((item) => {
      const textMatch =
        !searchQuery ||
        item.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const modelMatch =
        selectedModel === "All" ||
        item.model?.toLowerCase().includes(selectedModel.toLowerCase());

      const categoryMatch =
        selectedCategory === "All" ||
        item.category?.toLowerCase().includes(selectedCategory.toLowerCase());

      return textMatch && modelMatch && categoryMatch;
    });
  }, [prompts, searchQuery, selectedModel, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-zinc-100 selection:bg-indigo-600 selection:text-white">
      {/* 1. PromptHero Sticky Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#0b0f17]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1850px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                <Sparkles className="h-4 w-4" />
              </div>
              <span>Prompt<span className="text-indigo-400">Hero</span></span>
            </a>

            {/* Model Tabs */}
            <nav className="hidden items-center gap-1 md:flex">
              {MODELS.map((model) => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    selectedModel === model
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  {model}
                </button>
              ))}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts (e.g. realistic portrait, cyber city, retro anime)..."
              className="w-full rounded-full border border-zinc-800 bg-zinc-900/90 py-2 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-500 transition focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="hidden rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white sm:block">
              Submit Prompt
            </button>
            <button className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500">
              Get Pro
            </button>
          </div>
        </div>

        {/* 2. Sub-Header Category Pills */}
        <div className="border-t border-zinc-900 bg-[#090d14] px-4 py-2 sm:px-6">
          <div className="mx-auto flex max-w-[1850px] gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1 text-[11px] font-medium transition ${
                  selectedCategory === cat
                    ? "bg-white text-zinc-950 font-semibold shadow"
                    : "border border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 3. Masonry Gallery */}
      <main className="mx-auto max-w-[1850px] px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3 text-zinc-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            <p className="text-xs font-medium tracking-wide">Loading prompts...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center text-center">
            <Layers className="mb-3 h-10 w-10 text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-400">No prompts found</p>
            <p className="mt-1 text-xs text-zinc-600">Try changing your search terms or filters</p>
          </div>
        ) : (
          <div className="ph-masonry">
            {filteredPrompts.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPrompt(item)}
                className="ph-masonry-card group relative cursor-pointer overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900 transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black"
              >
                {/* Image */}
                <img
                  src={item.image_url}
                  alt={item.prompt}
                  loading="lazy"
                  className="w-full object-cover transition duration-500 group-hover:scale-[1.01]"
                />

                {/* Model Pill Tag */}
                <div className="absolute left-3 top-3 z-10">
                  <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 backdrop-blur-md">
                    {item.model}
                  </span>
                </div>

                {/* Dark Hover Card with Prompt Hero Action Bar */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <p className="line-clamp-3 text-xs leading-relaxed text-zinc-200 font-light">
                    {item.prompt}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                      {item.category || "General"}
                    </span>

                    <button
                      onClick={(e) => handleCopy(item.id, item.prompt, e)}
                      className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
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

      {/* 4. Prompt Details Modal (PromptHero Inspection Mode) */}
      {selectedPrompt && (
        <div
          onClick={() => setSelectedPrompt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d121c] shadow-2xl md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPrompt(null)}
              className="absolute right-4 top-4 z-20 rounded-full bg-black/60 p-2 text-zinc-400 backdrop-blur-md transition hover:bg-black/90 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left: Image Canvas */}
            <div className="flex flex-1 items-center justify-center bg-black/50 p-4 md:max-w-[55%]">
              <img
                src={selectedPrompt.image_url}
                alt={selectedPrompt.prompt}
                className="max-h-[75vh] w-auto rounded-lg object-contain"
              />
            </div>

            {/* Right: Prompt Parameters & Details */}
            <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6 text-sm">
              <div className="space-y-6">
                {/* Header info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-400">
                      {selectedPrompt.model}
                    </span>
                    <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                      {selectedPrompt.category || "General"}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-white">Prompt Details</h2>
                </div>

                {/* Positive Prompt */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <span>Prompt</span>
                    <button
                      onClick={() => handleCopyModal(selectedPrompt.prompt)}
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                    >
                      {copiedModal ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedModal ? "Copied" : "Copy text"}</span>
                    </button>
                  </div>
                  <p className="mt-2 rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-3 text-xs leading-relaxed text-zinc-200">
                    {selectedPrompt.prompt}
                  </p>
                </div>

                {/* Negative Prompt (if available) */}
                {selectedPrompt.negative_prompt && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Negative Prompt
                    </span>
                    <p className="mt-2 rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-3 text-xs leading-relaxed text-zinc-400">
                      {selectedPrompt.negative_prompt}
                    </p>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 text-xs">
                  <div>
                    <span className="text-zinc-500">Aspect Ratio</span>
                    <p className="mt-0.5 font-medium text-zinc-300">
                      {selectedPrompt.aspect_ratio || "1:1"}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">CFG Scale</span>
                    <p className="mt-0.5 font-medium text-zinc-300">
                      {selectedPrompt.cfg_scale || "7.0"}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Seed</span>
                    <p className="mt-0.5 font-medium text-zinc-300">
                      {selectedPrompt.seed || "Random"}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Author</span>
                    <p className="mt-0.5 font-medium text-zinc-300">
                      {selectedPrompt.author_name || "Community"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-8 flex items-center gap-3 pt-4 border-t border-zinc-800">
                <button
                  onClick={() => handleCopyModal(selectedPrompt.prompt)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copiedModal ? "Copied Prompt" : "Copy Full Prompt"}</span>
                </button>
                <a
                  href={selectedPrompt.image_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
