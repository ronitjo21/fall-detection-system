"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWorkers } from "../context/WorkerContext" // <-- We import the live data!

export default function Navbar() {
  const router = useRouter()
  const { workers } = useWorkers() // <-- Get the live workers
  
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false) // Controls the dropdown

  // --- Filter for actual active alerts ---
  const alerts = workers.filter(w => w.status !== "safe")
  const alertCount = alerts.length

  useEffect(() => {
    if (!isDarkMode) {
      document.documentElement.style.filter = "invert(1) hue-rotate(180deg)"
      document.documentElement.style.transition = "filter 0.5s ease"
    } else {
      document.documentElement.style.filter = "none"
    }
  }, [isDarkMode])

  const handleLogout = () => {
    localStorage.removeItem("role")
    router.push("/login")
  }

  return (
    <div className="flex justify-between items-center bg-[#111827] px-8 py-4 border-b border-slate-800 shadow-md z-20">

      <h1 className="text-xl font-bold text-white tracking-wide">
        Construction Site Monitor
      </h1>

      <div className="flex items-center gap-6">

        <select className="bg-[#1f2937] border border-slate-600 text-white text-sm font-semibold rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer shadow-sm">
          <option>Site A</option>
          <option>Site B</option>
          <option>Site C</option>
        </select>

        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center gap-2 bg-[#1f2937] border border-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm w-[90px] justify-center"
        >
          {isDarkMode ? "🌙 Dark" : "☀️ Light"}
        </button>

        {/* --- SMART NOTIFICATION BELL --- */}
        <div className="relative">
          <div 
            className="cursor-pointer hover:scale-110 transition-transform p-1"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span className="text-xl">🔔</span>
            {/* Only show the red dot if there are actual alerts! */}
            {alertCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                {alertCount}
              </div>
            )}
          </div>

          {/* --- NOTIFICATION DROPDOWN --- */}
          {showNotifications && (
            <div className="absolute right-0 mt-4 w-80 bg-[#1f2937] border border-slate-600 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in slide-in-from-top-2">
              <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex justify-between items-center">
                <h3 className="font-bold text-white text-sm">Active Notifications</h3>
                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-1 rounded-full font-bold">{alertCount} New</span>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
                {alertCount === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm font-medium">
                    ✅ All workers are currently safe.
                  </div>
                ) : (
                  alerts.map(worker => (
                    <div key={worker.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer flex gap-3 items-start">
                      <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shadow-[0_0_5px_currentColor] shrink-0 ${worker.status === 'critical' ? 'bg-red-500 text-red-500 animate-pulse' : 'bg-orange-500 text-orange-500'}`}></div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {worker.status === 'critical' ? 'CRITICAL ALERT' : 'Warning'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          <span className="text-slate-300 font-semibold">{worker.name} ({worker.id})</span> has triggered a system alert and requires immediate attention.
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {/* --- END SMART NOTIFICATION BELL --- */}

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/20 border border-emerald-800/50 rounded-full">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Live</span>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 border border-red-500 px-6 py-2 rounded-lg text-sm font-bold text-white hover:bg-red-500 transition-all shadow-[0_0_10px_rgba(220,38,38,0.3)] hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"
        >
          Logout
        </button>

      </div>
    </div>
  )
}