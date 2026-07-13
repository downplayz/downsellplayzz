import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, Clock, Flame, Star, ShieldAlert, KeyRound, Check, 
  Trash2, Plus, X, HelpCircle, RefreshCw, ChevronRight, Eye, Play, 
  Tv, Puzzle, Car, Sparkles, Layers, Trophy, Shield, Crown, Users, 
  Compass, Type, Coins, Edit3, Search
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import defaultGamesData from "./games.json";
import Header from "./components/Header";
import GameCard from "./components/GameCard";
import GameArena from "./components/GameArena";
import Logo from "./components/Logo";

// Sidebar categories with their corresponding icons
const SIDEBAR_CATEGORIES = [
  { name: "All Games", value: "All", icon: "Gamepad2" },
  { name: "Arcade", value: "Arcade", icon: "Tv" },
  { name: "Puzzle", value: "Puzzle", icon: "Puzzle" },
  { name: "Racing", value: "Racing", icon: "Car" },
  { name: "Match", value: "Match", icon: "Sparkles" },
  { name: "Card", value: "Card", icon: "Layers" },
  { name: "Sports", value: "Sports", icon: "Trophy" },
  { name: "Strategy", value: "Strategy", icon: "Shield" },
  { name: "Classic", value: "Classic", icon: "Crown" },
  { name: "Family", value: "Family", icon: "Users" },
  { name: "Adventure", value: "Adventure", icon: "Compass" },
  { name: "Word", value: "Word", icon: "Type" },
  { name: "Casino", value: "Casino", icon: "Coins" },
  { name: "Retro", value: "Retro", icon: "Flame" },
  { name: "Favorites", value: "Favorites", icon: "Star" },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGame, setActiveGame] = useState(null);
  
  // Local persistence states
  const [favoriteIds, setFavoriteIds] = useState(() => {
    const saved = localStorage.getItem("kira_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [recentIds, setRecentIds] = useState(() => {
    const saved = localStorage.getItem("kira_recents");
    return saved ? JSON.parse(saved) : [];
  });

  const [customGames, setCustomGames] = useState(() => {
    const saved = localStorage.getItem("kira_custom_games");
    return saved ? JSON.parse(saved) : [];
  });

  // Database edits & deletions states
  const [defaultGamesOverrides, setDefaultGamesOverrides] = useState(() => {
    const saved = localStorage.getItem("kira_default_overrides");
    return saved ? JSON.parse(saved) : {};
  });

  const [deletedDefaultIds, setDeletedDefaultIds] = useState(() => {
    const saved = localStorage.getItem("kira_deleted_defaults");
    return saved ? JSON.parse(saved) : [];
  });

  const [editingGameId, setEditingGameId] = useState(null);
  const [adminListSearch, setAdminListSearch] = useState("");

  // Admin Panels state
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("kira_admin_auth") === "true";
  });
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  // New Game Form Input States
  const [newGameTitle, setNewGameTitle] = useState("");
  const [newGameBanner, setNewGameBanner] = useState("");
  const [newGameLogo, setNewGameLogo] = useState("");
  const [newGameLegacy, setNewGameLegacy] = useState("");
  const [newGamePreviewVid, setNewGamePreviewVid] = useState("");
  const [newGameIframe, setNewGameIframe] = useState("");
  const [newGameCategory, setNewGameCategory] = useState("Arcade");
  const [newGameDesc, setNewGameDesc] = useState("");
  const [newGameControls, setNewGameControls] = useState("");
  const [formSuccessMsg, setFormSuccessMsg] = useState("");

  // Sync favorites
  useEffect(() => {
    localStorage.setItem("kira_favorites", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // Sync recents
  useEffect(() => {
    localStorage.setItem("kira_recents", JSON.stringify(recentIds));
  }, [recentIds]);

  // Sync custom games
  useEffect(() => {
    localStorage.setItem("kira_custom_games", JSON.stringify(customGames));
  }, [customGames]);

  // Sync default games overrides
  useEffect(() => {
    localStorage.setItem("kira_default_overrides", JSON.stringify(defaultGamesOverrides));
  }, [defaultGamesOverrides]);

  // Sync deleted default IDs
  useEffect(() => {
    localStorage.setItem("kira_deleted_defaults", JSON.stringify(deletedDefaultIds));
  }, [deletedDefaultIds]);

  // Parse deep URL parameters for clean loading on first render
  useEffect(() => {
    const path = window.location.pathname;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    if (cleanPath) {
      const matched = [...customGames, ...defaultGamesData].find(
        (g) => g.id === cleanPath || g.title.toLowerCase().replace(/\s+/g, "-") === cleanPath
      );
      if (matched) {
        setActiveGame(matched);
      }
    }
  }, [customGames]);

  // Merge default games and user created games with overrides and deletes
  const allGames = useMemo(() => {
    const defaults = defaultGamesData
      .filter((g) => !deletedDefaultIds.includes(g.id))
      .map((g) => {
        const override = defaultGamesOverrides[g.id];
        return override ? { ...g, ...override } : g;
      });
    return [...customGames, ...defaults];
  }, [customGames, defaultGamesOverrides, deletedDefaultIds]);

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

  // Play game and append to recents stack
  const handlePlayGame = useCallback((game) => {
    setActiveGame(game);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Clean address URL bar update
    const urlSlug = game.title.toLowerCase().replace(/\s+/g, "-");
    const currentPath = window.location.pathname;
    let prefix = "";
    const parts = currentPath.split("/");
    if (parts.length > 2) {
      prefix = parts[0];
    }
    window.history.pushState(null, "", `${prefix}/${urlSlug}`);

    // Update Recents
    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== game.id);
      return [game.id, ...filtered].slice(0, 5);
    });
  }, []);

  // Close active game and restore root path in address bar
  const handleCloseGame = useCallback(() => {
    setActiveGame(null);
    const currentPath = window.location.pathname;
    let prefix = "";
    const parts = currentPath.split("/");
    if (parts.length > 2) {
      prefix = parts[0];
    }
    window.history.pushState(null, "", `${prefix || "/"}`);
  }, []);

  // Map IDs back to full game objects
  const recentGames = useMemo(() => {
    return recentIds
      .map((id) => allGames.find((game) => game.id === id))
      .filter(Boolean);
  }, [recentIds, allGames]);

  // Filters logic
  const filteredGames = useMemo(() => {
    return allGames.filter((game) => {
      // 1. Category check
      if (selectedCategory === "Favorites") {
        if (!favoriteIds.includes(game.id)) return false;
      } else if (selectedCategory !== "All") {
        if (game.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // 2. Search check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = game.title.toLowerCase().includes(query);
        const matchesDesc = (game.description || "").toLowerCase().includes(query);
        const matchesCat = game.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [allGames, favoriteIds, selectedCategory, searchQuery]);

  // Featured game for the top main banner
  const featuredGame = useMemo(() => {
    // Pick the first custom game with a video or first default game
    const hasPreview = allGames.find(g => g.previewVid);
    return hasPreview || allGames[0];
  }, [allGames]);

  // Right-hand sidebar popular games (exclude featured)
  const rightHeroGames = useMemo(() => {
    if (!featuredGame) return [];
    return allGames.filter(g => g.id !== featuredGame.id).slice(0, 4);
  }, [allGames, featuredGame]);

  // Games picked just for you (render in legacy format)
  const legacySectionGames = useMemo(() => {
    // Filter out active or featured, take up to 6 games
    return allGames.slice(3, 9);
  }, [allGames]);

  // Handle Admin Authorization
  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    if (adminPassword === "Stenli91@*") {
      setIsAdmin(true);
      localStorage.setItem("kira_admin_auth", "true");
      setAdminLoginOpen(false);
      setAdminError("");
      setAdminPanelOpen(true);
      setAdminPassword("");
    } else {
      setAdminError("Invalid credentials. Try again.");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.setItem("kira_admin_auth", "false");
    setAdminPanelOpen(false);
  };

  // Populate form with game data to edit
  const handleEditGameClick = (game) => {
    setEditingGameId(game.id);
    setNewGameTitle(game.title || "");
    setNewGameBanner(game.banner || "");
    setNewGameLogo(game.logo || "");
    setNewGameLegacy(game.legacy || game.banner || "");
    setNewGamePreviewVid(game.previewVid || "");
    setNewGameIframe(game.iframe || game.iframeUrl || "");
    setNewGameCategory(game.category || "Arcade");
    setNewGameDesc(game.description || "");
    setNewGameControls(game.controls || "");
    
    // Quick success/status msg helper
    setFormSuccessMsg(`Editing "${game.title}"... Fill form below to edit and save changes!`);
    setTimeout(() => {
      setFormSuccessMsg("");
    }, 5000);
  };

  const handleCancelEdit = () => {
    setEditingGameId(null);
    setNewGameTitle("");
    setNewGameBanner("");
    setNewGameLogo("");
    setNewGameLegacy("");
    setNewGamePreviewVid("");
    setNewGameIframe("");
    setNewGameDesc("");
    setNewGameControls("");
  };

  // Add or Edit game form submission
  const handleAddGameSubmit = (e) => {
    e.preventDefault();
    if (!newGameTitle.trim()) {
      alert("Please provide a game name.");
      return;
    }
    if (!newGameIframe.trim()) {
      alert("Please provide the complete game iframe HTML or URL.");
      return;
    }

    const isRawIframe = newGameIframe.trim().toLowerCase().startsWith("<iframe");

    if (editingGameId) {
      // --- EDIT MODE ---
      const isCustom = customGames.some((g) => g.id === editingGameId);
      
      const updatedGame = {
        id: editingGameId,
        title: newGameTitle.trim(),
        banner: newGameBanner.trim() || "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=400",
        logo: newGameLogo.trim() || "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=100",
        legacy: newGameLegacy.trim() || newGameBanner.trim(),
        previewVid: newGamePreviewVid.trim() || undefined,
        category: newGameCategory,
        description: newGameDesc.trim() || "An unblocked HTML5 game uploaded via admin console.",
        controls: newGameControls.trim() || "Use mouse or standard keyboard controls.",
        icon: "Gamepad2",
        ...(isRawIframe 
          ? { iframe: newGameIframe.trim(), iframeUrl: undefined }
          : { iframeUrl: newGameIframe.trim(), iframe: undefined })
      };

      if (isCustom) {
        setCustomGames((prev) =>
          prev.map((g) => (g.id === editingGameId ? updatedGame : g))
        );
      } else {
        setDefaultGamesOverrides((prev) => ({
          ...prev,
          [editingGameId]: updatedGame,
        }));
      }

      setFormSuccessMsg(`Successfully saved changes to "${newGameTitle}"!`);
      setEditingGameId(null);
    } else {
      // --- CREATE/INSERT MODE ---
      const gameId = `custom-game-${Date.now()}`;
      const newGame = {
        id: gameId,
        title: newGameTitle.trim(),
        banner: newGameBanner.trim() || "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=400",
        logo: newGameLogo.trim() || "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=100",
        legacy: newGameLegacy.trim() || newGameBanner.trim(),
        previewVid: newGamePreviewVid.trim() || undefined,
        category: newGameCategory,
        description: newGameDesc.trim() || "An unblocked HTML5 game uploaded via admin console.",
        controls: newGameControls.trim() || "Use mouse or standard keyboard controls.",
        icon: "Gamepad2",
        ...(isRawIframe 
          ? { iframe: newGameIframe.trim() }
          : { iframeUrl: newGameIframe.trim() })
      };

      setCustomGames((prev) => [newGame, ...prev]);
      setFormSuccessMsg(`Successfully added "${newGameTitle}"!`);
    }

    // Reset fields
    setNewGameTitle("");
    setNewGameBanner("");
    setNewGameLogo("");
    setNewGameLegacy("");
    setNewGamePreviewVid("");
    setNewGameIframe("");
    setNewGameDesc("");
    setNewGameControls("");

    setTimeout(() => {
      setFormSuccessMsg("");
    }, 4000);
  };

  // Delete any game from database (custom or default)
  const handleDeleteGame = (gameId, gameTitle) => {
    if (confirm(`Are you sure you want to delete "${gameTitle || "this game"}" from the database?`)) {
      const isCustom = customGames.some((g) => g.id === gameId);
      if (isCustom) {
        setCustomGames((prev) => prev.filter((g) => g.id !== gameId));
      } else {
        setDeletedDefaultIds((prev) => [...prev, gameId]);
      }
      
      if (editingGameId === gameId) {
        setEditingGameId(null);
        setNewGameTitle("");
        setNewGameBanner("");
        setNewGameLogo("");
        setNewGameLegacy("");
        setNewGamePreviewVid("");
        setNewGameIframe("");
        setNewGameDesc("");
        setNewGameControls("");
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-blue-500/20 selection:text-blue-300">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLogoClick={() => {
          if (isAdmin) {
            setAdminPanelOpen(true);
          } else {
            setAdminLoginOpen(true);
          }
        }}
        isAdmin={isAdmin}
        onLogout={handleAdminLogout}
      />

      {/* Sidebar Layout + Content Area */}
      <div className="flex-1 max-w-[1450px] w-full mx-auto flex flex-col md:flex-row gap-0">
        
        {/* Left Sticky Vertical Sidebar (Desktop only) */}
        {!activeGame && (
          <aside className="w-64 flex-shrink-0 border-r border-slate-900 bg-[#0c101a] p-5 hidden md:flex flex-col justify-between">
            <div className="space-y-6">
              <div className="px-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Categories
                </h3>
              </div>
              <nav className="space-y-1">
                {SIDEBAR_CATEGORIES.map((cat) => {
                  const Icon = LucideIcons[cat.icon] || Gamepad2;
                  const isActive = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setSelectedCategory(cat.value);
                        setSearchQuery("");
                      }}
                      className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-blue-600/15 border border-blue-500/30 text-blue-400"
                          : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-100 border border-transparent"
                      }`}
                      id={`sidebar-cat-${cat.value.toLowerCase()}`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`h-4.5 w-4.5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                        <span>{cat.name}</span>
                      </span>
                      {cat.value === "Favorites" && favoriteIds.length > 0 && (
                        <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-black text-rose-400 border border-rose-500/20">
                          {favoriteIds.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="pt-6 border-t border-slate-900/60 text-center">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">
                Kira.Game Portal
              </span>
              <span className="text-[9px] text-slate-700 block mt-1">
                Smooth & Responsive
              </span>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-6 md:px-8 space-y-8 overflow-x-hidden">
          
          {/* Categories Horizontal scrolling track for Mobile Viewports only */}
          {!activeGame && (
            <div className="block md:hidden overflow-x-auto scrollbar-none py-1">
              <div className="flex gap-2">
                {SIDEBAR_CATEGORIES.map((cat) => {
                  const Icon = LucideIcons[cat.icon] || Gamepad2;
                  const isActive = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setSelectedCategory(cat.value);
                        setSearchQuery("");
                      }}
                      className={`whitespace-nowrap flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "border border-slate-800 bg-[#0e1320] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                      id={`mobile-cat-${cat.value.toLowerCase()}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeGame ? (
            /* Active Game Arena component */
            <GameArena
              game={activeGame}
              onClose={handleCloseGame}
              allGames={allGames}
              onPlayGame={handlePlayGame}
              isFavorite={favoriteIds.includes(activeGame.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
            /* Main Game Dashboard Grid */
            <div className="space-y-8">
              
              {/* Giant MSN-Style Hero Showcase Section at the top (All category, no search queries) */}
              {selectedCategory === "All" && !searchQuery && featuredGame && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-sans text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                      Need a quick break?
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      Jump into our most popular games
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left featured wide card */}
                    <div 
                      onClick={() => handlePlayGame(featuredGame)}
                      className="lg:col-span-7 relative h-[320px] sm:h-[400px] w-full rounded-[32px] overflow-hidden group cursor-pointer border border-slate-800/60 bg-[#121826] shadow-xl hover:border-blue-500/80 hover:shadow-[0_12px_28px_rgba(59,130,246,0.15)] transition-all duration-300"
                    >
                      <img 
                        src={featuredGame.banner} 
                        alt={featuredGame.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10 pointer-events-none" />

                      {/* Video overlay on hover */}
                      {featuredGame.previewVid && (
                        <video 
                          src={featuredGame.previewVid}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover z-15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        />
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20 text-left flex flex-col items-start gap-2.5">
                        <span className="flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-black text-blue-400 border border-blue-500/30 uppercase tracking-widest">
                          🎮 Popular Now
                        </span>
                        <h3 className="font-sans text-xl sm:text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                          {featuredGame.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-md line-clamp-2 leading-relaxed">
                          {featuredGame.description}
                        </p>
                        <button className="mt-2 flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all shadow-md">
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Play Now
                        </button>
                      </div>
                    </div>

                    {/* Right side 2x2 rectangular popular grid */}
                    <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                      {rightHeroGames.map((game) => (
                        <div
                          key={game.id}
                          onClick={() => handlePlayGame(game)}
                          className="relative aspect-video rounded-[24px] overflow-hidden group cursor-pointer border border-slate-800/40 bg-[#121826] shadow-lg hover:border-blue-500 hover:scale-[1.02] transition-all duration-300"
                        >
                          <img 
                            src={game.banner} 
                            alt={game.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent z-10 pointer-events-none" />

                          {game.previewVid && (
                            <video 
                              src={game.previewVid}
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="absolute inset-0 w-full h-full object-cover z-15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            />
                          )}

                          <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-left">
                            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block">
                              {game.category}
                            </span>
                            <h4 className="font-sans text-xs sm:text-sm font-black text-white group-hover:text-blue-400 transition-colors truncate mt-0.5">
                              {game.title}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* "Pick up where you left off" Section (Recents, horizontal tiny style) */}
              {recentGames.length > 0 && selectedCategory === "All" && !searchQuery && (
                <div className="space-y-3 pb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-300">
                      Pick up where you left off
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
                        className="flex-shrink-0 flex items-center gap-3 bg-[#111624] hover:bg-slate-900/80 border border-slate-800/60 px-4 py-3 rounded-2xl cursor-pointer group transition-all w-52 shadow-md"
                        id={`recent-card-${rg.id}`}
                      >
                        <img
                          src={rg.banner}
                          alt={rg.title}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-800 group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-400 truncate font-sans">
                            {rg.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-semibold">Play Again</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* "Games picked just for you" vertical legacy section from screenshots */}
              {selectedCategory === "All" && !searchQuery && legacySectionGames.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      <h3 className="text-sm font-bold text-slate-300">
                        Games picked just for you
                      </h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    {legacySectionGames.map((game) => (
                      <GameCard
                        key={`legacy-${game.id}`}
                        game={game}
                        onPlayGame={handlePlayGame}
                        isFavorite={favoriteIds.includes(game.id)}
                        onToggleFavorite={handleToggleFavorite}
                        variant="legacy"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Main Grid Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 pt-4">
                <div>
                  <h2 className="font-sans text-lg font-black tracking-tight text-white flex items-center gap-2">
                    <Flame className="h-4.5 w-4.5 text-orange-400 fill-orange-400" />
                    {selectedCategory === "All" 
                      ? "New games we love" 
                      : selectedCategory === "Favorites"
                      ? "Your Favorites"
                      : `${selectedCategory} Games`}
                  </h2>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {filteredGames.length} Available
                </span>
              </div>

              {/* Core Catalog Game Cards Grid */}
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
                        staggerChildren: 0.01
                      }
                    }
                  }}
                >
                  {filteredGames.map((game) => (
                    <motion.div
                      key={game.id}
                      variants={{
                        hidden: { opacity: 0, y: 8 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeOut" } }
                      }}
                    >
                      <GameCard
                        game={game}
                        onPlayGame={handlePlayGame}
                        isFavorite={favoriteIds.includes(game.id)}
                        onToggleFavorite={handleToggleFavorite}
                        variant="standard"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                /* High-Contrast Elegant Empty State */
                <div className="text-center py-20 rounded-3xl border border-dashed border-slate-850 bg-[#0e1320]">
                  <HelpCircle className="mx-auto h-12 w-12 text-slate-600" />
                  <h4 className="font-sans text-base font-bold text-slate-300 mt-4">
                    No Games Found
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                    We couldn't find any games matching "{searchQuery}". Try looking in another category or resetting the search!
                  </p>
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-colors cursor-pointer shadow-sm"
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
      </div>

      {/* Simple Dark Footer */}
      {!activeGame && (
        <footer className="mt-auto border-t border-slate-900 bg-[#070a10] py-8 px-4 z-10">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div 
              className="flex items-center gap-3 cursor-pointer select-none" 
              onClick={() => { 
                setSelectedCategory("All"); 
                setSearchQuery(""); 
              }}
            >
              <Logo size={36} />
              <span className="font-sans font-black text-lg text-white lowercase tracking-tight">
                kira.<span className="text-blue-500">game</span>
              </span>
            </div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              © 2026 Kira.Game • Play The Best Free Games Unblocked
            </div>
          </div>
        </footer>
      )}

      {/* ADMIN LOGIN MODAL */}
      <AnimatePresence>
        {adminLoginOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121826] border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <KeyRound className="h-5 w-5" />
                  <h3 className="font-sans text-base font-bold text-white">Admin Authentication</h3>
                </div>
                <button
                  onClick={() => {
                    setAdminLoginOpen(false);
                    setAdminPassword("");
                    setAdminError("");
                  }}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Enter Admin Security Key
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                    required
                    autoFocus
                  />
                </div>

                {adminError && (
                  <p className="text-xs font-bold text-rose-400">{adminError}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminLoginOpen(false);
                      setAdminPassword("");
                      setAdminError("");
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN PANEL DASHBOARD MODAL */}
      <AnimatePresence>
        {adminPanelOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="bg-[#0f1423] border border-slate-800 rounded-[32px] w-full max-w-5xl shadow-2xl overflow-hidden my-8"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between bg-[#13192b] border-b border-slate-800 px-6 py-4.5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-sans text-base font-extrabold text-white">Kira.Game Admin Console</h3>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">Add & Manage Portal Games</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdminPanelOpen(false)}
                    className="rounded-full bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Split Dashboard Body */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-[70vh] overflow-y-auto">
                
                {/* Left Side: Game Insertion Form */}
                <form onSubmit={handleAddGameSubmit} className="lg:col-span-7 p-6 space-y-4 border-r border-slate-800/80">
                  <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest border-b border-slate-800/60 pb-1 flex items-center justify-between">
                    <span>{editingGameId ? `Edit Game: ${newGameTitle || "Game"}` : "Insert New Game"}</span>
                    {editingGameId && (
                      <span className="text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black uppercase">
                        Edit Active
                      </span>
                    )}
                  </h4>

                  {formSuccessMsg && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400 font-semibold animate-fade-in">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>{formSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Game Name (Title) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Basket Random"
                        value={newGameTitle}
                        onChange={(e) => setNewGameTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 px-3 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Category *
                      </label>
                      <select
                        value={newGameCategory}
                        onChange={(e) => setNewGameCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 px-3 text-xs text-slate-100 focus:border-blue-500 focus:outline-none cursor-pointer"
                      >
                        {SIDEBAR_CATEGORIES.filter(c => c.value !== "All" && c.value !== "Favorites").map((c) => (
                          <option key={c.value} value={c.value} className="bg-[#121826]">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Horizontal Banner URL
                      </label>
                      <input
                        type="url"
                        placeholder="e.g. https://domain.com/banner.png"
                        value={newGameBanner}
                        onChange={(e) => setNewGameBanner(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 px-3 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Legacy (Vertical Banner) URL
                      </label>
                      <input
                        type="url"
                        placeholder="e.g. https://domain.com/vertical.png"
                        value={newGameLegacy}
                        onChange={(e) => setNewGameLegacy(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 px-3 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Small Logo/Icon URL
                      </label>
                      <input
                        type="url"
                        placeholder="e.g. https://domain.com/logo.png"
                        value={newGameLogo}
                        onChange={(e) => setNewGameLogo(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 px-3 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Preview Video URL (.mp4 file direct link)
                      </label>
                      <input
                        type="url"
                        placeholder="e.g. https://domain.com/preview.mp4"
                        value={newGamePreviewVid}
                        onChange={(e) => setNewGamePreviewVid(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 px-3 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                        title="This video will auto-play on game card hover"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Game IFrame Code (e.g. &lt;iframe id="iframehtml5" src="..."&gt;&lt;/iframe&gt;) *
                    </label>
                    <textarea
                      placeholder='<iframe id="iframehtml5" src="/basket-random.embed" width="100%" height="100%" title="Basket Random" frameborder="0" border="0" scrolling="auto" allowfullscreen=""></iframe>'
                      value={newGameIframe}
                      onChange={(e) => setNewGameIframe(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-100 focus:border-blue-500 focus:outline-none font-mono leading-relaxed"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Description / Info
                      </label>
                      <textarea
                        placeholder="Brief summary of the gameplay..."
                        value={newGameDesc}
                        onChange={(e) => setNewGameDesc(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        How To Play (Controls)
                      </label>
                      <textarea
                        placeholder="W, A, S, D to maneuver..."
                        value={newGameControls}
                        onChange={(e) => setNewGameControls(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    {editingGameId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 px-5 py-3 text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-102"
                    >
                      {editingGameId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {editingGameId ? "Save Changes" : "Add Game Instantly"}
                    </button>
                  </div>
                </form>

                {/* Right Side: Added Games List Manager with search, edit, delete capabilities */}
                <div className="lg:col-span-5 p-6 space-y-4 bg-[#0d121f] flex flex-col min-h-0">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-1">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Manage Games ({allGames.length})
                    </h4>
                  </div>

                  {/* Inner Search bar for games database list */}
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search database games..."
                      value={adminListSearch}
                      onChange={(e) => setAdminListSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pr-4 pl-9 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Filter and display results */}
                  {allGames.length > 0 ? (
                    (() => {
                      const query = adminListSearch.toLowerCase().trim();
                      const filtered = allGames.filter(
                        (g) =>
                          g.title.toLowerCase().includes(query) ||
                          g.category.toLowerCase().includes(query)
                      );
                      
                      if (filtered.length > 0) {
                        return (
                          <div className="space-y-2 max-h-[48vh] overflow-y-auto pr-1">
                            {filtered.map((g) => {
                              const isCustom = customGames.some((cg) => cg.id === g.id);
                              return (
                                <div
                                  key={g.id}
                                  className={`flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border gap-3 ${
                                    editingGameId === g.id ? "border-amber-500/40 bg-amber-500/5" : "border-slate-800/80"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <img
                                      src={g.banner}
                                      alt=""
                                      className="w-9 h-9 rounded-lg object-cover border border-slate-800 flex-shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <h5 className="text-xs font-bold text-slate-200 truncate">{g.title}</h5>
                                        {isCustom ? (
                                          <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1 py-0.2 rounded font-extrabold uppercase">
                                            Custom
                                          </span>
                                        ) : (
                                          <span className="text-[8px] bg-blue-500/15 text-blue-400 px-1 py-0.2 rounded font-extrabold uppercase">
                                            System
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">
                                        {g.category}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleEditGameClick(g)}
                                      className="rounded-xl border border-blue-950 bg-blue-950/20 p-2 text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                                      title="Edit game details"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteGame(g.id, g.title)}
                                      className="rounded-xl border border-rose-950 bg-rose-950/20 p-2 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                                      title="Delete game from database"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-center py-12 text-slate-600 space-y-2 border border-dashed border-slate-800 rounded-3xl">
                            <Gamepad2 className="h-8 w-8 mx-auto" />
                            <p className="text-xs">No matching games found.</p>
                            <p className="text-[10px] text-slate-700">Try adjusting your keywords!</p>
                          </div>
                        );
                      }
                    })()
                  ) : (
                    <div className="text-center py-12 text-slate-600 space-y-2 border border-dashed border-slate-800 rounded-3xl">
                      <Gamepad2 className="h-8 w-8 mx-auto" />
                      <p className="text-xs">Database is currently empty.</p>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
