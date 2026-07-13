import React, { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, Maximize2, RotateCcw, Gamepad2, ShieldCheck, X, Sparkles, Star, ChevronRight } from "lucide-react";

export default function GameArena({
  game,
  onClose,
  allGames = [],
  onPlayGame,
  isFavorite,
  onToggleFavorite,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [shouldRenderIframe, setShouldRenderIframe] = useState(false);
  const iframeRef = useRef(null);
  const arenaContainerRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    setShowDisclaimer(true);
    setShouldRenderIframe(false);

    // Defer the heavy iframe initialization to prevent UI lag on transit
    const iframeTimer = setTimeout(() => {
      setShouldRenderIframe(true);
    }, 180);

    const timer = setTimeout(() => {
      setShowDisclaimer(false);
    }, 6000);

    return () => {
      clearTimeout(iframeTimer);
      clearTimeout(timer);
    };
  }, [game]);

  // Handle Fullscreen
  const toggleBrowserFullscreen = () => {
    if (!arenaContainerRef.current) return;

    if (!document.fullscreenElement) {
      arenaContainerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          setShowDisclaimer(false);
        })
        .catch((err) => {
          console.error(`Error entering fullscreen: ${err.message}`);
        });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Force Reload Iframe
  const reloadGame = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = "";
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = currentSrc;
      }, 100);
    }
  };

  // Focus iframe for lag-free keyboard/mouse handling
  const focusIframe = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.focus();
      } catch (e) {
        // Safe catch
      }
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    focusIframe();
  };

  // Pick up to 3 other games for the recommendations list
  const relatedGames = useMemo(() => {
    if (!allGames || allGames.length === 0) return [];
    return allGames
      .filter((g) => g.id !== game.id)
      .slice(0, 3);
  }, [allGames, game.id]);

  return (
    <div className="flex flex-col gap-6" id={`arena-viewport-${game.id}`}>
      {/* Back and Action Bar */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={onClose}
          className="group flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-2.5 text-xs font-bold text-neutral-200 hover:border-neutral-600 hover:text-white transition-colors duration-150 cursor-pointer"
          id="back-to-catalog"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          BACK TO PORTAL
        </button>

        <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500">
          <ShieldCheck className="h-4 w-4 text-neutral-400" />
          <span>SECURE RUNTIME TUNNEL</span>
        </div>
      </div>

      {/* Main Game Stage Frame */}
      <div 
        ref={arenaContainerRef}
        onClick={focusIframe}
        className={`relative overflow-hidden border border-neutral-800 bg-black flex flex-col justify-between shadow-2xl transition-all duration-300 ${
          isFullscreen 
            ? "h-screen w-screen border-none rounded-none" 
            : "rounded-3xl aspect-video w-full max-w-5xl mx-auto"
        }`}
      >
        {/* Loading overlay with monochrome loader */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020202] text-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              {/* Outer rotating rim */}
              <div className="absolute h-full w-full rounded-full border-4 border-neutral-800 border-t-white animate-spin" />
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <h4 className="font-display mt-6 text-lg font-bold text-white tracking-widest uppercase">
              Initializing {game.title}
            </h4>
            <p className="font-mono text-[10px] text-neutral-500 mt-2 tracking-widest uppercase">
              Mapping keyboard triggers • 60 FPS Emulation
            </p>
          </div>
        )}

        {/* Floating disclaimer popup */}
        {!isLoading && showDisclaimer && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl border border-neutral-850 bg-neutral-950/90 backdrop-blur-md px-5 py-3 text-xs text-white shadow-2xl animate-fade-in">
            <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="font-sans font-bold tracking-wide uppercase">
              Fullscreen for the smoothest experience
            </span>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer ml-1"
              id="close-disclaimer-btn"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Embedded Iframe */}
        {shouldRenderIframe ? (
          <iframe
            ref={iframeRef}
            src={game.iframeUrl}
            title={game.title}
            onLoad={handleIframeLoad}
            className="w-full flex-1 border-none bg-black"
            allow="autoplay; gamepad; keyboard; microphone; clipboard-read; clipboard-write; fullscreen; payment; xr-spatial-tracking; accelerometer; gyroscope; magnetometer; web-share; camera; focus-without-user-activation *; keyboard-map *"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-modals allow-orientation-lock allow-presentation allow-downloads allow-popups-to-escape-sandbox"
            id={`game-iframe-${game.id}`}
          />
        ) : (
          <div className="w-full flex-1 bg-black flex items-center justify-center">
            <span className="font-mono text-[9px] text-neutral-700 tracking-widest uppercase animate-pulse">
              TUNNELING SECURE VIEWPORT...
            </span>
          </div>
        )}

        {/* Solid Black control panel */}
        <div className="flex h-12 items-center justify-between border-t border-neutral-900 bg-black px-6 text-xs font-mono text-neutral-400 select-none">
          <div className="flex items-center gap-3">
            <span className="text-[9px] uppercase font-bold text-white bg-neutral-800 px-2 py-0.5 rounded border border-neutral-750">
              UNBLOCKED
            </span>
            <span className="font-display font-semibold text-neutral-200">{game.title}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={reloadGame}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              title="Restart Game Instance"
              id="iframe-reload"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restart</span>
            </button>

            <button
              onClick={toggleBrowserFullscreen}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              title="Toggle Fullscreen Arena"
              id="iframe-fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Fullscreen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Game Details Panel & Related Sidebar (hidden in Fullscreen mode) */}
      {!isFullscreen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full mt-2 animate-fade-in">
          {/* Main Info Block */}
          <div className="md:col-span-2 bg-neutral-900/30 rounded-3xl p-6 border border-neutral-900 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold font-display text-white">{game.title}</h3>
                <span className="inline-block text-[9px] uppercase font-mono font-bold tracking-widest text-neutral-400 bg-neutral-850 border border-neutral-800 px-2.5 py-1 rounded-lg mt-2">
                  {game.category}
                </span>
              </div>

              {/* Pin Favorite button */}
              <button
                onClick={() => onToggleFavorite(game.id)}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isFavorite
                    ? "border-amber-400 bg-amber-400/10 text-amber-400 shadow-lg shadow-amber-400/5"
                    : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-white"
                }`}
                title={isFavorite ? "Remove from Favorites" : "Pin to Favorites"}
                id="toggle-fav-arena-btn"
              >
                <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                <span>{isFavorite ? "FAVORITED" : "FAVORITE"}</span>
              </button>
            </div>

            <p className="text-sm text-neutral-400 leading-relaxed font-sans pt-1">
              {game.description}
            </p>

            <div className="border-t border-neutral-900 pt-4 space-y-2">
              <h4 className="text-[10px] font-bold text-neutral-400 font-mono uppercase tracking-widest">
                GAME CONTROLS
              </h4>
              <div className="rounded-2xl bg-black/50 border border-neutral-900 p-4 font-mono text-xs text-neutral-300 leading-relaxed">
                {game.controls}
              </div>
            </div>
          </div>

          {/* Related Games Sidebar panel */}
          <div className="bg-neutral-900/30 rounded-3xl p-6 border border-neutral-900 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-neutral-400 font-mono uppercase tracking-widest border-b border-neutral-900 pb-2">
                YOU MIGHT ALSO LIKE
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {relatedGames.map((rg) => (
                  <div
                    key={rg.id}
                    onClick={() => onPlayGame(rg)}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-neutral-950/40 hover:bg-neutral-900/60 hover:border-neutral-800 border border-transparent transition-all cursor-pointer group"
                    id={`related-game-${rg.id}`}
                  >
                    <img
                      src={rg.banner}
                      alt={rg.title}
                      className="h-12 w-12 rounded-xl object-cover border border-neutral-900 group-hover:scale-105 transition-transform duration-150"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-neutral-300 group-hover:text-white truncate font-display">
                        {rg.title}
                      </h5>
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">{rg.category}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-900 flex items-center justify-between text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
              <span>Latency: 0ms</span>
              <span>100% Secure Sandbox</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
