import React from "react";
import { Search, X, Star } from "lucide-react";
import Logo from "./Logo";

export default function Header({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  favoriteCount = 0,
}) {
  const categories = [
    { label: "🎮 All Games", value: "All", color: "bg-blue-600 text-white hover:bg-blue-700" },
    { label: "🕹️ Arcade", value: "Arcade", color: "bg-orange-500 text-white hover:bg-orange-600" },
    { label: "🧩 Puzzle", value: "Puzzle", color: "bg-teal-500 text-white hover:bg-teal-600" },
    { label: "📺 Retro", value: "Retro", color: "bg-purple-600 text-white hover:bg-purple-700" },
    { label: "⭐ Favorites", value: "Favorites", color: "bg-rose-500 text-white hover:bg-rose-600" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur px-4 py-4 md:px-8 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* Brand Logo & Title with the Custom KG Logo */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="flex cursor-pointer items-center gap-3 active:scale-95 transition-transform"
            id="brand-logo-container"
          >
            <Logo size={44} />
            <span className="text-2xl font-black tracking-tight text-slate-800 lowercase font-sans select-none">
              kira.<span className="text-blue-600">game</span>
            </span>
          </div>
        </div>

        {/* Search Bar - Clean Poki style */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center md:max-w-xl md:justify-end">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-100 py-2.5 pr-10 pl-11 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-150"
              id="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                id="clear-search-btn"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Poki-style compact category pill track - horizontal slide */}
      <div className="mx-auto mt-4 max-w-7xl overflow-x-auto scrollbar-none py-1">
        <div className="flex gap-2.5">
          {categories.map((cat) => {
            const isFav = cat.value === "Favorites";
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                }}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold tracking-wide transition-all duration-150 cursor-pointer shadow-sm select-none ${
                  isActive
                    ? `${cat.color} scale-105 shadow-md`
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                }`}
                id={`cat-btn-${cat.value.toLowerCase()}`}
              >
                <span className="flex items-center gap-1.5">
                  {cat.label}
                  {isFav && favoriteCount > 0 && (
                    <span className={`ml-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-rose-50 text-rose-600"
                    }`}>
                      {favoriteCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
