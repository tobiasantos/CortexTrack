import React from "react";
import { useTracker } from "./useTracker";

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function App() {
  const {
    trackingActive,
    currentTab,
    totalTimeMs,
    topSites,
    loading,
    toggleTracking,
  } = useTracker();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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

      {/* Focus Score Placeholder */}
      <div className="px-5 py-4">
        <div className="bg-gray-900 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Focus Score
          </p>
          <p className="text-4xl font-bold text-emerald-400">--</p>
          <p className="text-xs text-gray-600 mt-1">
            Connect to backend to calculate
          </p>
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
            <p className="text-xl font-semibold">{topSites.length}</p>
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
            {topSites.map(({ domain, time }) => (
              <div
                key={domain}
                className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2"
              >
                <span className="text-sm text-gray-300 truncate mr-2">
                  {domain}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDuration(time)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-800 text-center">
        <p className="text-[10px] text-gray-700">CortexTrack v1.0.0</p>
      </div>
    </div>
  );
}
