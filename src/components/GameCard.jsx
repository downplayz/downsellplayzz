import React, { useState, useRef, useEffect, memo } from "react";
import { Play, Gamepad2, Star } from "lucide-react";
import * as LucideIcons from "lucide-react";

// Helper to determine stable dynamic card layout if not defined explicitly
export const getGameCardStyle = (game) => {
  if (game.cardStyle) return game.cardStyle;
  
  // Stable hash based on game ID to avoid reshuffling
  let hash = 0;
  const idStr = String(game.id || "");
  for (let i = 0; i < idStr.length; i++) {
    hash += idStr.charCodeAt(i);
  }
  
  const mod = hash % 5;
  if (mod === 0) return "rectangular";
  if (mod === 1) return "vertical";
  return "square";
};

function GameCard({
  game,
  onPlayGame,
  isFavorite = false,
  onToggleFavorite,
  styleOverride
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const style = styleOverride || getGameCardStyle(game);

  // Safe Lucide icon lookup
  const IconComponent = LucideIcons[game.icon] || Gamepad2;

  // Resolve correct image source based on layout type
  let imageSrc = game.banner;
  if (style === "square") {
    imageSrc = game.logo || game.banner;
  } else if (style === "vertical") {
    imageSrc = game.legacy || game.banner || game.logo;
  } else {
    // rectangular
    imageSrc = game.banner || game.logo;
  }

  // Handle video hover playback safely
  useEffect(() => {
    if (game.previewVid && videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch((err) => {
          console.log("Card preview play exception:", err);
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, game.previewVid]);

  // Reset image loaded status if game or image source changes
  useEffect(() => {
    setImgLoaded(false);
  }, [imageSrc]);

  // Determine grid span classes
  let spanClass = "col-span-1";
  let aspectClass = "aspect-square";
  if (style === "rectangular") {
    spanClass = "col-span-1 sm:col-span-2";
    aspectClass = "aspect-[16/10] sm:aspect-[2/1]";
  } else if (style === "vertical") {
    spanClass = "col-span-1";
    aspectClass = "aspect-[3/4]";
  }

  return (
    <div
      onClick={() => onPlayGame(game)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative ${spanClass} ${aspectClass} rounded-[24px] overflow-hidden border border-slate-700/50 bg-[#1a2236] hover:border-blue-400 hover:shadow-[0_12px_28px_rgba(59,130,246,0.3)] cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-sm select-none`}
      id={`game-card-${game.id}`}
    >
      {/* Dynamic Image Wrapper */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-900">
        {imageSrc ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-slate-900 animate-pulse flex flex-col items-center justify-center gap-2 z-10">
                <IconComponent className="h-5 w-5 text-slate-700 animate-bounce" />
                <span className="font-sans text-[8px] text-slate-500 font-bold tracking-wider uppercase">Loading</span>
              </div>
            )}
            <img
              src={imageSrc}
              alt={game.title}
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-108 ${
                imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              loading="lazy"
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 w-full h-full">
            <IconComponent className="h-8 w-8 text-slate-500" />
          </div>
        )}

        {/* Dynamic Video Hover Overlay */}
        {game.previewVid && (
          <video
            ref={videoRef}
            src={game.previewVid}
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-20 pointer-events-none ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Hover Gradient Overlay - Shows the dark overlay only on hover for title readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />

        {/* Overlaid details - Only shown on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-30 flex items-center gap-2.5 text-left opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
          {game.logo ? (
            <img
              src={game.logo}
              alt=""
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-xl object-cover border border-white/20 shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
              <IconComponent className="h-3.5 w-3.5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-sans text-xs font-black text-slate-100 group-hover:text-blue-400 transition-colors truncate">
              {game.title}
            </h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
              {game.category || "Game"}
            </span>
          </div>
        </div>

        {/* Play Button Icon Overlay in Center - elegant scale effect on hover */}
        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-4.5 w-4.5 fill-current text-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Favorite Star Overlay Button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game.id);
          }}
          className={`absolute top-3 right-3 z-30 rounded-full p-2 border transition-all duration-300 backdrop-blur-md cursor-pointer shadow-sm ${
            isFavorite
              ? "border-rose-500/30 bg-rose-500/25 text-rose-400 opacity-100 scale-100 animate-pulse"
              : "border-slate-700/50 bg-slate-900/80 text-slate-400 hover:border-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 scale-90 hover:scale-105"
          }`}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          id={`fav-btn-card-${game.id}`}
        >
          <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-rose-400 text-rose-400" : ""}`} />
        </button>
      )}
    </div>
  );
}

export default memo(GameCard);
