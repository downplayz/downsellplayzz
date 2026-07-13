import React, { useState } from "react";
import { Play, Gamepad2, Star } from "lucide-react";
import * as LucideIcons from "lucide-react";

export default function GameCard({
  game,
  onPlayGame,
  isFavorite = false,
  onToggleFavorite,
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  // Dynamic safe icon lookup
  const IconComponent = LucideIcons[game.icon] || Gamepad2;

  return (
    <div
      onClick={() => onPlayGame(game)}
      className="group relative aspect-square rounded-2xl overflow-hidden border border-neutral-900 bg-neutral-950 hover:border-neutral-700 hover:shadow-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-md"
      id={`game-card-${game.id}`}
    >
      {/* Monochrome Soft Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/5 to-black/60 opacity-60 group-hover:opacity-40 transition-opacity duration-300 z-10 pointer-events-none" />

      {/* Favorite Star Overlay Button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Avoid triggering onPlayGame
            onToggleFavorite(game.id);
          }}
          className={`absolute top-3 right-3 z-20 rounded-xl p-2 border transition-all duration-300 backdrop-blur-md cursor-pointer ${
            isFavorite
              ? "border-amber-400 bg-amber-400/10 text-amber-400 opacity-100 scale-100"
              : "border-neutral-850 bg-neutral-950/80 text-neutral-500 hover:border-neutral-600 hover:text-white opacity-0 group-hover:opacity-100 scale-95 hover:scale-105"
          }`}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          id={`fav-btn-card-${game.id}`}
        >
          <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
        </button>
      )}

      {/* Main Banner Visuals (Central Game Icon or Banner image with Shimmer skeleton) */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center bg-neutral-950">
        {game.banner ? (
          <>
            {/* Shimmer loading placeholder */}
            {!imgLoaded && (
              <div className="absolute inset-0 bg-neutral-900 animate-pulse flex flex-col items-center justify-center gap-2">
                <IconComponent className="h-6 w-6 text-neutral-600 animate-bounce" />
                <span className="font-mono text-[8px] text-neutral-600 tracking-wider uppercase">Loading</span>
              </div>
            )}
            <img
              src={game.banner}
              alt={game.title}
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              loading="lazy"
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 w-full h-full">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-md">
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5 rounded-t-2xl" />
              <IconComponent className="h-8 w-8 text-white" />
            </div>
          </div>
        )}

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-black shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-5 w-5 fill-current text-black ml-0.5" />
          </div>
        </div>
      </div>

      {/* Solid Black/Gray Title Bar */}
      <div className="w-full bg-neutral-950 border-t border-neutral-900 py-3 px-4 text-center z-10">
        <h3 className="font-display text-xs font-bold text-neutral-400 group-hover:text-white transition-colors tracking-wide truncate">
          {game.title}
        </h3>
      </div>
    </div>
  );
}
