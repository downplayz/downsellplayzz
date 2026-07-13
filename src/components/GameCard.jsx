import React, { useState, useRef, useEffect, memo } from "react";
import { Play, Gamepad2, Star } from "lucide-react";
import * as LucideIcons from "lucide-react";

function GameCard({
  game,
  onPlayGame,
  isFavorite = false,
  onToggleFavorite,
  variant = "standard" // "standard" or "legacy"
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  // Dynamic safe icon lookup
  const IconComponent = LucideIcons[game.icon] || Gamepad2;

  // Handle video playback play/pause safely on hover
  useEffect(() => {
    if (game.previewVid && videoRef.current) {
      if (isHovered) {
        // Attempt play, catching any browser auto-play policy exceptions
        videoRef.current.play().catch((err) => {
          console.log("Hover video play exception:", err);
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, game.previewVid]);

  if (variant === "legacy") {
    // Legacy full-height vertical card style as requested
    const legacyImg = game.legacy || game.banner;

    return (
      <div
        onClick={() => onPlayGame(game)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative h-[300px] w-full rounded-[24px] overflow-hidden border border-slate-800/40 bg-slate-900 cursor-pointer transition-all duration-300 shadow-lg select-none hover:shadow-[0_12px_28px_rgba(59,130,246,0.25)] hover:border-blue-500 hover:-translate-y-1.5"
        id={`game-card-legacy-${game.id}`}
      >
        {/* Main Background Image */}
        {legacyImg ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-slate-900 animate-pulse flex flex-col items-center justify-center gap-2 z-10">
                <IconComponent className="h-6 w-6 text-slate-700 animate-bounce" />
                <span className="font-sans text-[9px] text-slate-500 font-bold tracking-wider uppercase">Loading</span>
              </div>
            )}
            <img
              src={legacyImg}
              alt={game.title}
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950">
            <IconComponent className="h-10 w-10 text-slate-600" />
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
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 pointer-events-none ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Gradient Bottom Mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-20 pointer-events-none" />

        {/* Favorite Star Overlay Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(game.id);
            }}
            className={`absolute top-3.5 right-3.5 z-30 rounded-full p-2 border transition-all duration-300 backdrop-blur-sm cursor-pointer shadow-sm ${
              isFavorite
                ? "border-rose-500/30 bg-rose-500/20 text-rose-400 opacity-100 scale-100"
                : "border-slate-700/50 bg-slate-900/80 text-slate-400 hover:border-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 scale-95 hover:scale-110"
            }`}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            id={`fav-btn-legacy-${game.id}`}
          >
            <Star className={`h-4 w-4 ${isFavorite ? "fill-rose-500 text-rose-400" : ""}`} />
          </button>
        )}

        {/* Overlaid Game details at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col gap-1 text-left">
          <div className="flex items-center gap-1.5">
            {game.logo && (
              <img
                src={game.logo}
                alt=""
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-md object-cover border border-white/10"
              />
            )}
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">
              {game.category || "Game"}
            </span>
          </div>
          <h3 className="font-sans text-sm font-extrabold text-white group-hover:text-blue-400 transition-colors truncate">
            {game.title}
          </h3>
        </div>

        {/* Tiny Hover Play Button Center */}
        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-15">
          <div className="h-11 w-11 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-5 w-5 fill-current text-white ml-0.5" />
          </div>
        </div>
      </div>
    );
  }

  // Standard rounded tile (aspect-square/horizontal)
  return (
    <div
      onClick={() => onPlayGame(game)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative aspect-square rounded-[24px] overflow-hidden border border-slate-800/40 bg-[#121826] hover:border-blue-500 hover:shadow-[0_12px_28px_rgba(59,130,246,0.25)] cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-sm select-none"
      id={`game-card-${game.id}`}
    >
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-blue-500/[0.01] opacity-100 group-hover:opacity-0 transition-opacity duration-300 z-10 pointer-events-none" />

      {/* Favorite Star Overlay Button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game.id);
          }}
          className={`absolute top-3.5 right-3.5 z-30 rounded-full p-2 border transition-all duration-300 backdrop-blur-sm cursor-pointer shadow-sm ${
            isFavorite
              ? "border-rose-500/30 bg-rose-500/20 text-rose-400 opacity-100 scale-100"
              : "border-slate-700/50 bg-slate-900/80 text-slate-400 hover:border-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 scale-95 hover:scale-110"
          }`}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          id={`fav-btn-card-${game.id}`}
        >
          <Star className={`h-4 w-4 ${isFavorite ? "fill-rose-400 text-rose-450" : ""}`} />
        </button>
      )}

      {/* Main image container */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-900">
        {game.banner ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-slate-900 animate-pulse flex flex-col items-center justify-center gap-2">
                <IconComponent className="h-6 w-6 text-slate-700 animate-bounce" />
                <span className="font-sans text-[9px] text-slate-500 font-bold tracking-wider uppercase">Loading</span>
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
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 border border-slate-700 shadow-sm">
              <IconComponent className="h-8 w-8 text-slate-500" />
            </div>
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

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-15">
          <div className="h-11 w-11 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-5 w-5 fill-current text-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Solid Title Bar */}
      <div className="w-full bg-[#121826] border-t border-slate-800/40 py-3 px-4 flex items-center gap-2 z-10">
        {game.logo && (
          <img
            src={game.logo}
            alt=""
            referrerPolicy="no-referrer"
            className="w-5 h-5 rounded-md object-cover border border-white/5"
          />
        )}
        <h3 className="flex-1 font-sans text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors tracking-wide truncate text-left">
          {game.title}
        </h3>
      </div>
    </div>
  );
}

export default memo(GameCard);
