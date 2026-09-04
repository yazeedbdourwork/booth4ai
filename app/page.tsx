"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from '../lib/supabase';
import { Search, Copy, Check, Sparkles, SlidersHorizontal, Image as ImageIcon, Plus, X } from "lucide-react";
export interface PromptRecord {
  id: string;
  title: string;
  prompt_text: string;
  negative_prompt?: string | null;
  model: string;
  category: string;
  aspect_ratio: string;
  image_url: string;
  seed: number;
  cfg_scale: number;
  likes_count: number;
}

export default function HomePage() {
  const [prompts, setPrompts] = useState<PromptRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeModalPrompt, setActiveModalPrompt] = useState<PromptRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // Form states
  const [fTitle, setFTitle] = useState("");
  const [fImage, setFImage] = useState("");
  const [fModel, setFModel] = useState("Midjourney v6");
  const [fCategory, setFCategory] = useState("Photorealistic");
  const [fPrompt, setFPrompt] = useState("");
  const [fNegative, setFNegative] = useState("");
  const [fRatio, setFRatio] = useState("16:9");

  const models = ["All", "Midjourney v6", "FLUX.1 [dev]", "Stable Diffusion XL", "GPT Image 2", "DALL-E 3"];
  const categories = ["All", "Photorealistic", "Cinematic", "Infographic", "Retro Art", "3D & Concept"];

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setPrompts(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.prompt_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.model.toLowerCase().includes(searchQuery.toLowerCase());
      const matchModel = selectedModel === "All" || p.model === selectedModel;
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      return matchSearch && matchModel && matchCat;
    });
  }, [prompts, searchQuery, selectedModel, selectedCategory]);

  const handleCopy = (id: string, text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      title: fTitle,
      image_url: fImage,
      model: fModel,
      category: fCategory,
      prompt_text: fPrompt,
      negative_prompt: fNegative || null,
      aspect_ratio: fRatio,
      seed: Math.floor(Math.random() * 9000000) + 100000,
      cfg_scale: 7.0,
      likes_count: 1,
    };

    const { error } = await supabase.from("prompts").insert([newEntry]);
    if (!error) {
      setIsSubmitOpen(false);
      setFTitle("");
      setFImage("");
      setFPrompt("");
      setFNegative("");
      fetchPrompts();
    } else {
      alert("Error saving: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.18),transparent_70%)] pointer-events-none z-0" />

      {/* Floating Header */}
      <header className="sticky top-4 z-40 max-w-6xl mx-auto px-4">
        <nav className="bg-[#121216]/90 border border-[#27272a] backdrop-blur-md px-6 py-3.5 rounded-full flex items-center justify-between shadow-2xl">
          <a href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Prompt<span className="text-indigo-400">Vault</span></span>
          </a>
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Post Blueprint
          </button>
        </nav>
      </header>

      {/* Hero Header */}
      <div className="relative z-10 pt-16 pb-8 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-300 mb-5">
          <Sparkles className="w-3.5 h-3.5" /> High-Performance AI Prompt Discovery
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.12]">
          Turn Ideas Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Visual Reality</span>
        </h1>

        {/* Search */}
        <div className="mt-8 relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts, models (e.g. isometric, brutalist, anime, 35mm)..."
            className="w-full pl-12 pr-4 py-3.5 rounded-full bg-[#121216]/90 border border-[#27272a] focus:border-indigo-500 focus:outline-none text-sm placeholder-zinc-500 text-zinc-100 shadow-2xl transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {models.map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModel(mod)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                selectedModel === mod
                  ? "border-indigo-500 bg-indigo-500/15 text-indigo-300 font-medium"
                  : "border-[#27272a] bg-[#121216] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#121216] border border-[#27272a] rounded-lg px-3 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Pinterest-Style Masonry Grid */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 mt-8">
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-20 bg-[#121216]/50 border border-[#27272a] rounded-2xl">
            <p className="text-zinc-400 text-sm">No prompts match your active search filters.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                onClick={() => setActiveModalPrompt(prompt)}
                className="masonry-item group relative rounded-2xl bg-[#121216] border border-[#27272a] overflow-hidden cursor-pointer hover:border-zinc-600 transition-all hover:shadow-2xl"
              >
                <img
                  src={prompt.image_url}
                  alt={prompt.title}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Dark Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-indigo-300 border border-white/10">
                      {prompt.model}
                    </span>
                    <button
                      onClick={(e) => handleCopy(prompt.id, prompt.prompt_text, e)}
                      className="p-2 rounded-full bg-zinc-800/90 hover:bg-indigo-600 text-white transition-all shadow-md"
                    >
                      {copiedId === prompt.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{prompt.title}</h3>
                    <p className="text-[11px] text-zinc-300 font-mono line-clamp-2 leading-relaxed mt-1">
                      {prompt.prompt_text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {activeModalPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#121216] border border-[#27272a] rounded-2xl max-w-3xl w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalPrompt(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-full bg-zinc-900 border border-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full max-h-96 rounded-xl overflow-hidden mb-5 border border-zinc-800 bg-zinc-950 flex items-center justify-center">
              <img src={activeModalPrompt.image_url} alt={activeModalPrompt.title} className="w-full h-full object-contain" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
                {activeModalPrompt.model}
              </span>
              <span className="text-xs text-zinc-400">• {activeModalPrompt.category}</span>
              <span className="text-xs font-mono text-zinc-500">• {activeModalPrompt.aspect_ratio}</span>
            </div>

            <h2 className="text-xl font-bold text-white mb-4">{activeModalPrompt.title}</h2>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs sm:text-sm font-mono leading-relaxed mb-4 select-all">
              {activeModalPrompt.prompt_text}
            </div>

            {activeModalPrompt.negative_prompt && (
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-300 text-xs font-mono mb-4">
                <span className="text-red-400 font-semibold block mb-1">Negative Prompt:</span>
                {activeModalPrompt.negative_prompt}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setActiveModalPrompt(null)}
                className="px-4 py-2 rounded-full border border-[#27272a] text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Close
              </button>
              <button
                onClick={() => handleCopy(activeModalPrompt.id, activeModalPrompt.prompt_text)}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 font-medium text-xs text-white"
              >
                {copiedId === activeModalPrompt.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedId === activeModalPrompt.id ? "Copied!" : "Copy Full Prompt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Studio Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#121216] border border-[#27272a] rounded-2xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSubmitOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-1">Submit Prompt Blueprint</h2>
            <p className="text-xs text-zinc-400 mb-6">Store your AI prompt directly into the persistent live database.</p>

            <form onSubmit={handlePostSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-zinc-400 mb-1">Title</label>
                <input required type="text" value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="Prompt title..." className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block font-semibold uppercase text-zinc-400 mb-1">Image URL</label>
                <input required type="url" value={fImage} onChange={(e) => setFImage(e.target.value)} placeholder="https://..." className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-zinc-400 mb-1">Model</label>
                  <select value={fModel} onChange={(e) => setFModel(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-indigo-500">
                    <option value="Midjourney v6">Midjourney v6</option>
                    <option value="FLUX.1 [dev]">FLUX.1 [dev]</option>
                    <option value="Stable Diffusion XL">Stable Diffusion XL</option>
                    <option value="GPT Image 2">GPT Image 2</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase text-zinc-400 mb-1">Aspect Ratio</label>
                  <select value={fRatio} onChange={(e) => setFRatio(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-indigo-500">
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Vertical)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="3:4">3:4 (Poster)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold uppercase text-zinc-400 mb-1">Prompt Text</label>
                <textarea required rows={4} value={fPrompt} onChange={(e) => setFPrompt(e.target.value)} placeholder="Full blueprint text..." className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono leading-relaxed focus:outline-none focus:border-indigo-500"></textarea>
              </div>
              <div>
                <label className="block font-semibold uppercase text-zinc-400 mb-1">Negative Prompt (Optional)</label>
                <input type="text" value={fNegative} onChange={(e) => setFNegative(e.target.value)} placeholder="distorted, blurry, lowres" className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-all shadow-lg shadow-indigo-600/30">
                Publish to Gallery
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
