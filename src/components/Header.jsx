import React from "react";
import { Search, Gamepad2, X } from "lucide-react";

export default function Header({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  favoriteCount = 0,
}) {
  const categories = [
    { label: "All Games", value: "All" },
    { label: "🕹️ Arcade", value: "Arcade" },
    { label: "🧩 Puzzle", value: "Puzzle" },
    { label: "📺 Retro", value: "Retro" },
    { label: "⭐ Favorites", value: "Favorites" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-900 bg-[#020202] px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="flex cursor-pointer items-center gap-2 group"
          >
            <div>
              <h1 className="font-display text-xl font-extrabold tracking-widest text-white md:text-2xl uppercase">
                POKI<span className="text-neutral-400">MONO</span>
              </h1>
              <p className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest font-semibold">
                MINIMALIST ARCADE • ULTRA SMOOTH
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center md:max-w-xl md:justify-end">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search unblocked games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 py-2.5 pr-10 pl-11 text-sm text-white placeholder-neutral-500 focus:border-white/50 focus:bg-neutral-850 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors duration-150"
              id="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                id="clear-search-btn"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Poki-style compact category pill track - monochrome */}
      <div className="mx-auto mt-4 max-w-7xl overflow-x-auto scrollbar-none py-1">
        <div className="flex gap-2">
          {categories.map((cat) => {
            const isFav = cat.value === "Favorites";
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                }}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold tracking-wide border transition-all duration-150 cursor-pointer ${
                  selectedCategory === cat.value
                    ? "border-white bg-white text-black"
                    : "border-neutral-900 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
                }`}
                id={`cat-btn-${cat.value.toLowerCase()}`}
              >
                {cat.label}
                {isFav && favoriteCount > 0 && (
                  <span className={`ml-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-mono ${
                    selectedCategory === "Favorites" ? "bg-black text-white" : "bg-neutral-800 text-neutral-300"
                  }`}>
                    {favoriteCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
