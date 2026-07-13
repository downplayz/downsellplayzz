import React, { useState, memo } from "react";
import { Play, Gamepad2, Star } from "lucide-react";
import * as LucideIcons from "lucide-react";

function GameCard({
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
      className="group relative aspect-square rounded-[24px] overflow-hidden border border-slate-150/70 bg-white hover:border-blue-500 hover:shadow-[0_12px_28px_rgba(59,130,246,0.18)] cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-sm select-none poki-bouncy-hover"
      id={`game-card-${game.id}`}
    >
      {/* Playful Soft Overlay */}
      <div className="absolute inset-0 bg-blue-500/[0.02] opacity-100 group-hover:opacity-0 transition-opacity duration-300 z-10 pointer-events-none" />

      {/* Favorite Star Overlay Button - styled elegantly like Poki */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Avoid triggering onPlayGame
            onToggleFavorite(game.id);
          }}
          className={`absolute top-3.5 right-3.5 z-20 rounded-full p-2 border transition-all duration-300 backdrop-blur-sm cursor-pointer shadow-sm ${
            isFavorite
              ? "border-rose-200 bg-rose-50 text-rose-500 opacity-100 scale-100"
              : "border-slate-100 bg-white/90 text-slate-400 hover:border-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 scale-95 hover:scale-110"
          }`}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          id={`fav-btn-card-${game.id}`}
        >
          <Star className={`h-4 w-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      )}

      {/* Main Banner Visuals (Central Game Icon or Banner image with Shimmer skeleton) */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-50">
        {game.banner ? (
          <>
            {/* Shimmer loading placeholder */}
            {!imgLoaded && (
              <div className="absolute inset-0 bg-slate-100 animate-pulse flex flex-col items-center justify-center gap-2">
                <IconComponent className="h-6 w-6 text-slate-300 animate-bounce" />
                <span className="font-sans text-[9px] text-slate-400 font-bold tracking-wider uppercase">Loading</span>
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
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
              <IconComponent className="h-8 w-8 text-slate-600" />
            </div>
          </div>
        )}

        {/* Hover Play Button Overlay - styled like Poki's blue button */}
        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-5 w-5 fill-current text-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Solid Playful Title Bar */}
      <div className="w-full bg-white border-t border-slate-100/80 py-3.5 px-4 text-center z-10">
        <h3 className="font-sans text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors tracking-wide truncate">
          {game.title}
        </h3>
      </div>
    </div>
  );
}

export default memo(GameCard);
