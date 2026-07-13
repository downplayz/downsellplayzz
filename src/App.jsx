import React, { useState, useMemo, useEffect } from "react";
import Header from "./components/Header";
import GameCard from "./components/GameCard";
import GameArena from "./components/GameArena";
import defaultGamesData from "./games.json";
import { Gamepad2, RefreshCw, HelpCircle, Flame, Star, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

  // Sync favorites with localStorage
  useEffect(() => {
    localStorage.setItem("pokimono_favorites", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // Sync recents with localStorage
  useEffect(() => {
    localStorage.setItem("pokimono_recents", JSON.stringify(recentIds));
  }, [recentIds]);

  // Toggle favorite status
  const handleToggleFavorite = (gameId) => {
    setFavoriteIds((prev) => {
      if (prev.includes(gameId)) {
        return prev.filter((id) => id !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  };

  // Play game and append to recents stack
  const handlePlayGame = (game) => {
    setActiveGame(game);
    window.scrollTo({ top: 0, behavior: "smooth" });

    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== game.id);
      // Limit list to last 5 played
      return [game.id, ...filtered].slice(0, 5);
    });
  };

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
    <div className="relative min-h-screen bg-[#020202] text-neutral-100 flex flex-col font-sans overflow-hidden selection:bg-white selection:text-black">
      
      {/* Background Ambience Accent */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-neutral-900/10 blur-[100px] pointer-events-none" />

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
            onClose={() => setActiveGame(null)}
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
              <div className="space-y-3 pb-4 border-b border-neutral-900">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-neutral-500 animate-pulse" />
                  <h3 className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                    RECENTLY RESUMED
                  </h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
                  {recentGames.map((rg) => (
                    <motion.div
                      key={rg.id}
                      onClick={() => handlePlayGame(rg)}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex-shrink-0 flex items-center gap-3 bg-neutral-950/60 hover:bg-neutral-900/60 border border-neutral-900 hover:border-neutral-800 px-4 py-3 rounded-2xl cursor-pointer group transition-colors duration-150 w-52"
                      id={`recent-card-${rg.id}`}
                    >
                      <img
                        src={rg.banner}
                        alt={rg.title}
                        className="h-10 w-10 rounded-xl object-cover border border-neutral-900 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-neutral-300 group-hover:text-white truncate font-display">
                          {rg.title}
                        </h4>
                        <span className="text-[9px] font-mono text-neutral-500 uppercase">Resume Play</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Region Banner */}
            <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-white flex items-center gap-2 uppercase">
                  <Flame className="h-5 w-5 text-white" />
                  {selectedCategory === "All" 
                    ? "ARCADE GRID" 
                    : selectedCategory === "Favorites"
                    ? "FAVORITED INSTANCES"
                    : `${selectedCategory} REGION`}
                </h2>
                <p className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest mt-1">
                  OPTIMIZED SANDBOX • {filteredGames.length} COMPATIBLE UNITS
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
                      staggerChildren: 0.05
                    }
                  }
                }}
              >
                {filteredGames.map((game) => (
                  <motion.div
                    key={game.id}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
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
              <div className="text-center py-20 rounded-3xl border border-dashed border-neutral-900 bg-neutral-950/20">
                <HelpCircle className="mx-auto h-12 w-12 text-neutral-700" />
                <h4 className="font-display text-xs font-bold text-neutral-400 mt-4 tracking-widest">
                  NO COMPATIBLE INSTANCES
                </h4>
                <p className="text-[10px] text-neutral-500 mt-2 max-w-xs mx-auto font-mono leading-relaxed uppercase tracking-wide">
                  Zero units matched "{searchQuery || selectedCategory}" in the secure catalog.
                </p>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-850 bg-neutral-900 px-4 py-2.5 text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    RESET PORTAL
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Simple Footer */}
      {!activeGame && (
        <footer className="relative z-10 mt-auto border-t border-neutral-950 bg-black py-6 px-4">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-white" />
              <span className="font-display font-bold text-xs text-white tracking-widest uppercase">
                POKI GLASS HUB
              </span>
            </div>
            <div className="text-[9px] text-neutral-600 font-mono tracking-widest uppercase">
              SECURED MONOCHROME SANDBOX • PERFORMANCE: ULTRA SMOOTH
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
