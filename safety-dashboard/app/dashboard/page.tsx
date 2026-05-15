"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWorkers } from "../context/WorkerContext"

import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import StatCard from "../components/Statcard"
import AlertsTable from "../components/AlertsTable"
import LiveChart from "../components/LiveChart"
import SiteMap from "../components/SiteMap"
import ActivityFeed from "../components/ActivityFeed"
import AIPrediction from "../components/AIPrediction"
import BatteryMonitor from "../components/BatteryMonitor"
import SupervisorPanel from "../components/SupervisorPanel"
import AlertPopup from "../components/AlertPopup"
import WorkerModal from "../components/WorkerModal" 

export default function Dashboard() {
  const router = useRouter()
  const { workers } = useWorkers() 
  
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  // 1. Auth Check
  useEffect(() => {
    const role = localStorage.getItem("role")
    if (!role) {
      router.push("/login")
    }
  }, [router])

  // Helper variables for emergency state
  const hasCriticalFall = workers.some(w => w.status === "critical")

  // --- BULLETPROOF NATIVE AUDIO WATCHER ---
  useEffect(() => {
    const siren = document.getElementById("emergency-siren") as HTMLAudioElement
    if (!siren) return

    if (hasCriticalFall && !isMuted) {
      siren.play().catch(e => console.log("Waiting for user to click screen..."))
    } else {
      siren.pause()
      siren.currentTime = 0 // Reset audio so it starts fresh next time
    }

    if (!hasCriticalFall && isMuted) {
      setIsMuted(false)
    }
  }, [hasCriticalFall, isMuted])

  return (
    <div className="flex bg-[#0b1220] min-h-screen text-white relative overflow-hidden font-sans">

      {/* --- NATIVE AUDIO TAG --- */}
      {/* Invisible but perfectly reliable. Prevents overlapping audio bugs. */}
      <audio id="emergency-siren" src="/alarm.wav" loop className="hidden" />

      {/* GLOBAL EMERGENCY OVERLAY */}
      {hasCriticalFall && (
        <div className="fixed inset-0 pointer-events-none z-[9999] animate-pulse">
          <div className="absolute inset-0 border-[12px] border-red-600/40 blur-sm"></div>
          <div className="absolute inset-0 border-[4px] border-red-500"></div>
          <div className="absolute inset-0 bg-red-900/5"></div>
        </div>
      )}

      <AlertPopup />

      {selectedWorkerId && (
        <WorkerModal 
          workerId={selectedWorkerId} 
          onClose={() => setSelectedWorkerId(null)} 
        />
      )}

      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-10 space-y-10 z-10">

          {/* --- UPDATED HEADER SECTION --- */}
          <div className="flex justify-between items-end border-b border-slate-800 pb-6">
            <div>
              <h2 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-sm">
                Site Overview
              </h2>
              <p className="text-slate-400 mt-2 text-sm font-medium tracking-wide uppercase">
                AI-Powered Construction Safety Monitor
              </p>
            </div>
            
            <div className="flex gap-4">
              {hasCriticalFall && (
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2 border ${
                    isMuted 
                      ? "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700" 
                      : "bg-red-600 border-red-500 text-white hover:bg-red-500 animate-pulse shadow-red-900/50"
                  }`}
                >
                  {isMuted ? "🔇 Alarm Silenced" : "🔊 Silence Siren"}
                </button>
              )}

              <button 
                onClick={() => setSelectedWorkerId("W01")}
                className="bg-blue-600 border border-blue-500 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
              >
                 👁️ Test Vitals Modal
              </button>
            </div>
          </div>
          {/* --- END UPDATED HEADER --- */}

          <div className="grid grid-cols-4 gap-8">
            <StatCard title="Active Workers" value={workers.length.toString()} color="text-blue-400" />
            <StatCard title="Active Alerts" value={workers.filter(w => w.status !== 'safe').length.toString()} color="text-yellow-400" />
            <StatCard title="Falls Today" value={workers.filter(w => w.status === 'critical').length.toString()} color="text-red-500" />
            <StatCard title="Avg Battery" value="78%" color="text-green-400" />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <AlertsTable />
            <LiveChart />
          </div>

          <SiteMap onWorkerClick={setSelectedWorkerId} />

          <div className="grid grid-cols-3 gap-8">
            <ActivityFeed />
            <AIPrediction />
            <BatteryMonitor />
          </div>

          <SupervisorPanel />

        </div>
      </div>
    </div>
  )
}