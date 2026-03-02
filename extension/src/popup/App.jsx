import React, { useState, useEffect } from "react";
import { useTracker } from "./useTracker";
import LoginForm from "./LoginForm";
import { isAuthenticated, logout } from "../utils/api";
import { storage } from "../utils/storage";

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function App() {
  const [authed, setAuthed] = useState(null); // null = loading
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const loggedIn = await isAuthenticated();
    setAuthed(loggedIn);
    if (loggedIn) {
      const email = await storage.get("userEmail");
      setUserEmail(email || "");
    }
  }

  async function handleLogout() {
    await logout();
    setAuthed(false);
    setUserEmail("");
  }

  if (authed === null) {
    return (
      <div className="bg-gray-950 text-white min-h-[500px] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <LoginForm
        onLogin={async () => {
          await checkAuth();
          // Trigger immediate sync after login
          try {
            await chrome.runtime.sendMessage({ type: "FORCE_SYNC" });
          } catch {}
        }}
      />
    );
  }

  return <TrackerView userEmail={userEmail} onLogout={handleLogout} />;
}

function TrackerView({ userEmail, onLogout }) {
  const {
    trackingActive,
    currentTab,
    focusScore,
    totalTimeMs,
    topSites,
    siteCount,
    pendingCount,
    syncing,
    loading,
    toggleTracking,
    forceSync,
  } = useTracker();

  if (loading) {
    return (
      <div className="bg-gray-950 text-white min-h-[500px] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">CortexTrack</h1>
          <button
            onClick={toggleTracking}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              trackingActive
                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            }`}
          >
            {trackingActive ? "Tracking" : "Paused"}
          </button>
        </div>
        {currentTab && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            {currentTab.title || currentTab.url}
          </p>
        )}
      </div>

      {/* Focus Score */}
      <div className="px-5 py-4">
        <div className="bg-gray-900 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Focus Score
          </p>
          <p className={`text-4xl font-bold ${
            focusScore != null
              ? focusScore >= 60 ? "text-emerald-400" : focusScore >= 30 ? "text-yellow-400" : "text-red-400"
              : "text-gray-600"
          }`}>
            {focusScore != null ? Math.round(focusScore) : "--"}
          </p>
          {focusScore == null && (
            <p className="text-xs text-gray-600 mt-1">
              Sync data to calculate
            </p>
          )}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="px-5 pb-3">
        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Today
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-xs text-gray-500">Total Time</p>
            <p className="text-xl font-semibold">
              {totalTimeMs > 0 ? formatDuration(totalTimeMs) : "0m"}
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-xs text-gray-500">Sites Visited</p>
            <p className="text-xl font-semibold">{siteCount || topSites.length}</p>
          </div>
        </div>
      </div>

      {/* Top Sites */}
      <div className="px-5 pb-5 flex-1">
        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Top Sites
        </h2>
        {topSites.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-4">
            No activity recorded yet
          </p>
        ) : (
          <div className="space-y-2">
            {topSites.map(({ domain, time, category }) => (
              <div
                key={domain}
                className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 truncate mr-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    category === "productive" ? "bg-emerald-400" :
                    category === "distraction" ? "bg-red-400" : "bg-gray-500"
                  }`} />
                  <span className="text-sm text-gray-300 truncate">
                    {domain}
                  </span>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDuration(time)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Bar */}
      <div className="px-5 py-2 border-t border-gray-800 flex items-center justify-between">
        <span className="text-[10px] text-gray-600">
          {pendingCount} pending event{pendingCount !== 1 ? "s" : ""}
        </span>
        <button
          onClick={forceSync}
          disabled={syncing}
          className="text-[10px] text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync now"}
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 py-2 border-t border-gray-800 flex items-center justify-between">
        <p className="text-[10px] text-gray-600 truncate mr-2">{userEmail}</p>
        <button
          onClick={onLogout}
          className="text-[10px] text-gray-500 hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
