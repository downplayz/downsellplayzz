import React from "react";
import { Search, X, ShieldAlert, LogOut } from "lucide-react";
import Logo from "./Logo";

export default function Header({
  searchQuery,
  setSearchQuery,
  onLogoClick,
  isAdmin = false,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/40 bg-[#0a0d14]/90 backdrop-blur px-4 py-4 md:px-8 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        
        {/* Brand Logo & Title with the Custom Game Logo */}
        <div 
          onClick={onLogoClick}
          className="flex cursor-pointer items-center gap-3 active:scale-95 transition-transform group"
          id="brand-logo-container"
          title="Click to access Admin Panel"
        >
          <Logo size={42} />
          <span className="text-xl md:text-2xl font-black tracking-tight text-white font-sans select-none">
            kira.<span className="text-blue-500 group-hover:text-blue-400 transition-colors">game</span>
          </span>
          {isAdmin && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-400 border border-emerald-500/30 tracking-wider uppercase animate-pulse">
              <ShieldAlert className="h-3 w-3" />
              Admin
            </span>
          )}
        </div>

        {/* Search Bar - Clean Dark style */}
        <div className="flex flex-1 max-w-md items-center justify-end">
          <div className="relative w-full">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search unblocked games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-800/80 bg-slate-900/60 py-2.5 pr-10 pl-11 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-150"
              id="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                id="clear-search-btn"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Logout if Admin */}
        {isAdmin && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Log out of Admin Panel"
            id="admin-logout-btn"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
