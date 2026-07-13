import React, { useState, useMemo, useEffect, useCallback } from "react";
import Header from "./components/Header";
import GameCard from "./components/GameCard";
import GameArena from "./components/GameArena";
import Logo from "./components/Logo";
import defaultGamesData from "./games.json";
import { Gamepad2, RefreshCw, HelpCircle, Flame, Star, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Helper function to generate clean, URL-friendly slugs for games
const getGameSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export default function App() {
  // Navigation State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeGame, setActiveGame] = useState(null);

  // Favorites state persisted in localStorage
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const stored = localStorage.getItem("pokimono_favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Recently played game IDs persisted in localStorage
  const [recentIds, setRecentIds] = useState(() => {
    try {
      const stored = localStorage.getItem("pokimono_recents");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Parse route from URL on mount and whenever popstate (Back/Forward) is triggered
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const match = path.match(/\/game\/play\/([^/]+)/);
      if (match) {
        const slug = match[1];
        const foundGame = defaultGamesData.find(
          (g) => getGameSlug(g.title) === slug
        );
        if (foundGame) {
          setActiveGame(foundGame);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }
      setActiveGame(null);
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  // Sync favorites with localStorage
  useEffect(() => {
    localStorage.setItem("pokimono_favorites", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // Sync recents with localStorage
  useEffect(() => {
    localStorage.setItem("pokimono_recents", JSON.stringify(recentIds));
  }, [recentIds]);

  // Toggle favorite status
  const handleToggleFavorite = useCallback((gameId) => {
    setFavoriteIds((prev) => {
      if (prev.includes(gameId)) {
        return prev.filter((id) => id !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  }, []);

  // Play game, update address bar to clean custom URL path, and append to recents stack
  const handlePlayGame = useCallback((game) => {
    setActiveGame(game);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const slug = getGameSlug(game.title);
    const currentPath = window.location.pathname;
    const newPath = `/game/play/${slug}`;

    // Compute prefix for subfolder hosting environments (like GitHub Pages or Vercel subdirectory previews)
    let prefix = "";
    if (!currentPath.startsWith("/game/play") && currentPath !== "/") {
      const parts = currentPath.split("/game/play");
      if (parts[0] && parts[0] !== "/") {
        prefix = parts[0];
      } else {
        const firstSegment = currentPath.split("/")[1];
        if (firstSegment && firstSegment !== "game" && firstSegment !== "index.html") {
          prefix = `/${firstSegment}`;
        }
      }
    }

    window.history.pushState(null, "", `${prefix}${newPath}`);

    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== game.id);
      // Limit list to last 5 played
      return [game.id, ...filtered].slice(0, 5);
    });
  }, []);

  // Close active game and restore root path in address bar
  const handleCloseGame = useCallback(() => {
    setActiveGame(null);
    const currentPath = window.location.pathname;
    let prefix = "";
    const parts = currentPath.split("/game/play");
    if (parts[0] && parts[0] !== "/") {
      prefix = parts[0];
    }
    window.history.pushState(null, "", `${prefix || "/"}`);
  }, []);

  // Map IDs back to full game objects
  const recentGames = useMemo(() => {
    return recentIds
      .map((id) => defaultGamesData.find((game) => game.id === id))
      .filter(Boolean);
  }, [recentIds]);

  // Filters logic
  const filteredGames = useMemo(() => {
    return defaultGamesData.filter((game) => {
      // 1. Category check
      if (selectedCategory === "Favorites") {
        if (!favoriteIds.includes(game.id)) return false;
      } else if (selectedCategory !== "All") {
        if (game.category !== selectedCategory) return false;
      }

      // 2. Search check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = game.title.toLowerCase().includes(query);
        const matchesDesc = game.description.toLowerCase().includes(query);
        const matchesCat = game.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [favoriteIds, selectedCategory, searchQuery]);

  return (
    <div className="relative min-h-screen bg-[#f1f3f6] text-slate-800 flex flex-col font-sans overflow-x-hidden selection:bg-blue-200 selection:text-blue-900">
      
      {/* Background Ambience Accent */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-400/5 blur-[100px] pointer-events-none" />

      {/* Header component */}
      {!activeGame && (
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          favoriteCount={favoriteIds.length}
        />
      )}

      {/* Main viewport */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:px-8 space-y-8">
        
        {activeGame ? (
          /* Active Game Arena Component */
          <GameArena
            game={activeGame}
            onClose={handleCloseGame}
            allGames={defaultGamesData}
            onPlayGame={handlePlayGame}
            isFavorite={favoriteIds.includes(activeGame.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          /* Main Portal Dashboard Grid */
          <div className="space-y-8">
            
            {/* Recently Played row (Only on "All Games" category when recents exist) */}
            {recentGames.length > 0 && selectedCategory === "All" && !searchQuery && (
              <div className="space-y-3 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Recently Played
                  </h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-1.5 scrollbar-none">
                  {recentGames.map((rg) => (
                    <motion.div
                      key={rg.id}
                      onClick={() => handlePlayGame(rg)}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex-shrink-0 flex items-center gap-3 bg-white hover:bg-slate-50/80 border border-slate-200 px-4 py-3 rounded-2xl cursor-pointer group transition-all w-52 shadow-sm"
                      id={`recent-card-${rg.id}`}
                    >
                      <img
                        src={rg.banner}
                        alt={rg.title}
                        className="h-10 w-10 rounded-xl object-cover border border-slate-100 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-700 group-hover:text-blue-600 truncate font-sans">
                          {rg.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">Play Again</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Region Banner */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="font-sans text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
                  {selectedCategory === "All" 
                    ? "Popular Games" 
                    : selectedCategory === "Favorites"
                    ? "Your Favorites"
                    : `${selectedCategory} Games`}
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">
                  Play {filteredGames.length} Free Games Unblocked
                </p>
              </div>
            </div>

             {/* Grid of game tiles */}
            {filteredGames.length > 0 ? (
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.02
                    }
                  }
                }}
              >
                {filteredGames.map((game) => (
                  <motion.div
                    key={game.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
                    }}
                  >
                    <GameCard
                      game={game}
                      onPlayGame={handlePlayGame}
                      isFavorite={favoriteIds.includes(game.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* High-Contrast Elegant Empty State */
              <div className="text-center py-20 rounded-3xl border border-dashed border-slate-200 bg-white">
                <HelpCircle className="mx-auto h-12 w-12 text-slate-400" />
                <h4 className="font-sans text-base font-bold text-slate-700 mt-4">
                  No Games Found
                </h4>
                <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                  We couldn't find any games matching "{searchQuery}". Try looking in another category or resetting the search!
                </p>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-colors cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Show All Games
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Simple Footer */}
      {!activeGame && (
        <footer className="relative z-10 mt-auto border-t border-slate-200 bg-white py-8 px-4">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}>
              <Logo size={36} />
              <span className="font-sans font-black text-lg text-slate-800 lowercase tracking-tight">
                kira.<span className="text-blue-600">game</span>
              </span>
            </div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              © 2026 Kira.Game • Play The Best Free Games Unblocked
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
