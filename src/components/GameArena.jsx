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

    // Defer the heavy iframe initialization to prevent UI lag on transition
    const iframeTimer = setTimeout(() => {
      setShouldRenderIframe(true);
    }, 180);

    const timer = setTimeout(() => {
      setShowDisclaimer(false);
    }, 6000);

    // For custom raw HTML iframe strings, let's auto-clear loading after a short safety delay
    let autoLoadTimer;
    if (game.iframe) {
      autoLoadTimer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }

    return () => {
      clearTimeout(iframeTimer);
      clearTimeout(timer);
      if (autoLoadTimer) clearTimeout(autoLoadTimer);
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
    setIsLoading(true);
    if (game.iframe) {
      // For raw iframe code, toggling shouldRenderIframe forces a complete remount
      setShouldRenderIframe(false);
      setTimeout(() => {
        setShouldRenderIframe(true);
        setIsLoading(false);
      }, 150);
    } else if (iframeRef.current) {
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
          className="group flex items-center gap-2 rounded-2xl border border-slate-700 bg-[#25324e] px-5 py-2.5 text-xs font-bold text-slate-300 hover:border-slate-600 hover:text-white transition-colors duration-150 cursor-pointer shadow-sm"
          id="back-to-catalog"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back To Games
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>100% Free & Unblocked</span>
        </div>
      </div>

      {/* Main Game Stage Frame */}
      <div 
        ref={arenaContainerRef}
        onClick={focusIframe}
        className={`relative overflow-hidden border border-slate-800/80 bg-slate-950 flex flex-col justify-between shadow-2xl transition-all duration-300 ${
          isFullscreen 
            ? "h-screen w-screen border-none rounded-none" 
            : "rounded-3xl aspect-video w-full max-w-5xl mx-auto"
        }`}
      >
        {/* Loading overlay with modern spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#090d16] text-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              {/* Outer rotating rim */}
              <div className="absolute h-full w-full rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
              <Gamepad2 className="h-8 w-8 text-blue-500" />
            </div>
            <h4 className="font-sans mt-6 text-lg font-bold text-slate-200 tracking-wide">
              Loading {game.title}...
            </h4>
            <p className="text-xs text-slate-500 mt-2">
              Get ready to play unblocked instantly!
            </p>
          </div>
        )}

        {/* Floating disclaimer popup */}
        {!isLoading && showDisclaimer && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-md px-5 py-3 text-xs text-slate-200 shadow-lg animate-fade-in">
            <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
            <span className="font-sans font-bold tracking-wide uppercase">
              Go Fullscreen For The Best Experience
            </span>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-100 transition-colors cursor-pointer ml-1"
              id="close-disclaimer-btn"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Embedded Iframe */}
        <div className="w-full flex-1 bg-slate-950 flex flex-col relative">
          {shouldRenderIframe ? (
            game.iframe ? (
              /* Custom raw HTML Iframe injection as requested */
              <div
                id="custom-iframe-wrapper"
                className="w-full h-full flex-1"
                dangerouslySetInnerHTML={{ __html: game.iframe }}
                style={{
                  willChange: "transform",
                  transform: "translate3d(0, 0, 0)",
                  backfaceVisibility: "hidden"
                }}
              />
            ) : (
              /* Standard Iframe URL loading */
              <iframe
                ref={iframeRef}
                src={game.iframeUrl}
                title={game.title}
                onLoad={handleIframeLoad}
                className="w-full h-full flex-1 border-none bg-black"
                allow="autoplay; gamepad; keyboard; microphone; clipboard-read; clipboard-write; fullscreen; payment; xr-spatial-tracking; accelerometer; gyroscope; magnetometer; web-share; camera; focus-without-user-activation *; keyboard-map *"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-modals allow-orientation-lock allow-presentation allow-downloads allow-popups-to-escape-sandbox"
                id={`game-iframe-${game.id}`}
                style={{
                  willChange: "transform",
                  transform: "translate3d(0, 0, 0)",
                  backfaceVisibility: "hidden"
                }}
              />
            )
          ) : (
            <div className="w-full h-full flex-1 bg-slate-950 flex items-center justify-center">
              <span className="text-xs text-slate-500 tracking-wide animate-pulse">
                Loading Game Player...
              </span>
            </div>
          )}
        </div>

        {/* Solid control panel styled for dark theme */}
        <div className="flex h-14 items-center justify-between border-t border-slate-700/60 bg-[#25324e] px-6 text-xs text-slate-300 select-none">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
              FREE PLAY
            </span>
            <span className="font-sans font-bold text-slate-100">{game.title}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={reloadGame}
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-pointer font-semibold"
              title="Restart Game Instance"
              id="iframe-reload"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restart</span>
            </button>

            <button
              onClick={toggleBrowserFullscreen}
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-pointer font-semibold"
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
          <div className="md:col-span-2 bg-[#25324e] rounded-3xl p-6 border border-slate-700/40 shadow-lg space-y-4 text-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold font-sans text-slate-100">{game.title}</h3>
                <span className="inline-block text-[10px] uppercase font-bold tracking-wide text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg mt-2">
                  {game.category}
                </span>
              </div>

              {/* Pin Favorite button */}
              <button
                onClick={() => onToggleFavorite(game.id)}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isFavorite
                    ? "border-rose-500/30 bg-rose-500/20 text-rose-400 shadow-sm"
                    : "border-slate-700/40 bg-[#2e3e61] text-slate-300 hover:border-slate-500 hover:text-white"
                }`}
                title={isFavorite ? "Remove from Favorites" : "Pin to Favorites"}
                id="toggle-fav-arena-btn"
              >
                <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-rose-500 text-rose-450" : ""}`} />
                <span>{isFavorite ? "FAVORITED" : "FAVORITE"}</span>
              </button>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed font-sans pt-1">
              {game.description || "An amazing unblocked HTML5 game to play instantly in your browser."}
            </p>

            <div className="border-t border-slate-800/60 pt-4 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                How To Play
              </h4>
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 text-xs text-slate-300 leading-relaxed">
                {game.controls || "Use the mouse, touch, or standard keyboard controls to play."}
              </div>
            </div>
          </div>

          {/* Related Games Sidebar panel */}
          <div className="bg-[#25324e] rounded-3xl p-6 border border-slate-700/40 shadow-lg flex flex-col justify-between text-slate-200">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800/60 pb-2">
                More Fun Games
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {relatedGames.map((rg) => (
                  <div
                    key={rg.id}
                    onClick={() => onPlayGame(rg)}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700/60 border border-transparent transition-all cursor-pointer group"
                    id={`related-game-${rg.id}`}
                  >
                    <img
                      src={rg.banner}
                      alt={rg.title}
                      className="h-12 w-12 rounded-xl object-cover border border-slate-800 group-hover:scale-105 transition-transform duration-150"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-200 group-hover:text-blue-400 truncate font-sans">
                        {rg.title}
                      </h5>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">{rg.category}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-semibold">kira.game</span>
              <span>Play Instantly</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
