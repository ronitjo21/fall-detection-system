"use client"

import React, { useState } from "react"
// NEW: Import the context so we can talk to the global state
import { useWorkers } from "../context/WorkerContext" 

type AlertStatus = "CRITICAL" | "ENGAGED" | "ENROUTE" | "RESOLVED" | "LOG"

interface FeedItem {
  id: string
  workerId: string
  event: string
  time: string
  status: AlertStatus
}

const INITIAL_FEED: FeedItem[] = [
  { id: "1", workerId: "W02", event: "Fall Detected", time: "Just now", status: "CRITICAL" },
  { id: "2", workerId: "W02", event: "Emergency Triggered", time: "1 min ago", status: "ENROUTE" },
  { id: "3", workerId: "W03", event: "Proximity Warning", time: "5 min ago", status: "ENGAGED" },
  { id: "4", workerId: "W01", event: "Entered Zone B", time: "12 min ago", status: "LOG" },
]

export default function ActivityFeed() {
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED)
  
  // NEW: Get the function to update global worker status
  const { updateWorkerStatus } = useWorkers() 

  const handleAction = (id: string, currentStatus: AlertStatus, workerId: string) => {
    let nextStatus: AlertStatus = currentStatus
    
    if (currentStatus === "CRITICAL") {
      nextStatus = "ENGAGED"
      // TELL THE GLOBAL STATE THE EMERGENCY IS ACKNOWLEDGED!
      if (updateWorkerStatus) {
        updateWorkerStatus(workerId, "warning") // Changes Map dot to Orange
      }
    }
    else if (currentStatus === "ENGAGED") nextStatus = "ENROUTE"
    else if (currentStatus === "ENROUTE") {
      nextStatus = "RESOLVED"
      // TELL THE GLOBAL STATE THE EMERGENCY IS RESOLVED!
      if (updateWorkerStatus) {
        updateWorkerStatus(workerId, "safe") // Changes Map dot back to Green
      }
    }

    setFeed(feed.map(item => item.id === id ? { ...item, status: nextStatus } : item))
  }

  const getStatusStyles = (status: AlertStatus) => {
    switch(status) {
      case "CRITICAL": return { border: "border-red-500", bg: "bg-red-900/20", text: "text-red-400", dot: "bg-red-500 animate-pulse", btn: "bg-red-600 hover:bg-red-500 text-white" }
      case "ENGAGED": return { border: "border-yellow-500", bg: "bg-yellow-900/20", text: "text-yellow-400", dot: "bg-yellow-500", btn: "bg-yellow-600 hover:bg-yellow-500 text-white" }
      case "ENROUTE": return { border: "border-blue-500", bg: "bg-blue-900/20", text: "text-blue-400", dot: "bg-blue-500 animate-pulse", btn: "bg-blue-600 hover:bg-blue-500 text-white" }
      case "RESOLVED": return { border: "border-emerald-500/50", bg: "bg-emerald-900/10", text: "text-emerald-500", dot: "bg-emerald-500", btn: "hidden" }
      case "LOG": return { border: "border-slate-600", bg: "bg-slate-800/50", text: "text-slate-400", dot: "bg-slate-500", btn: "hidden" }
    }
  }

  const getButtonText = (status: AlertStatus) => {
    switch(status) {
      case "CRITICAL": return "Acknowledge Alert"
      case "ENGAGED": return "Dispatch Medical Team"
      case "ENROUTE": return "Mark as Resolved"
      default: return ""
    }
  }

  return (
    <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 h-[400px] flex flex-col shadow-lg">
      <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
        <h3 className="text-lg font-bold text-white">Live Activity Feed</h3>
        <span className="text-xs font-semibold bg-blue-900/50 text-blue-400 px-2 py-1 rounded border border-blue-800">Live Updates</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {feed.map((item) => {
          const styles = getStatusStyles(item.status)
          const isResolvedOrLog = item.status === "RESOLVED" || item.status === "LOG"

          return (
            <div key={item.id} className={`p-4 rounded-xl border-l-4 transition-all duration-300 ${styles.border} ${styles.bg} ${isResolvedOrLog ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-slate-100">{item.event}</h4>
                  <p className="text-sm text-slate-400 mt-1">
                    Worker: <span className="font-semibold text-slate-300">{item.workerId}</span> • {item.time}
                  </p>
                </div>
                
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${styles.text}`}>
                  <span className={`w-2 h-2 rounded-full ${styles.dot}`}></span>
                  {item.status}
                </div>
              </div>

              {!isResolvedOrLog && (
                <button
                  // NEW: Pass the workerId to the handler so it knows who to update!
                  onClick={() => handleAction(item.id, item.status, item.workerId)} 
                  className={`mt-3 w-full py-2 text-sm font-bold rounded-lg transition-colors ${styles.btn}`}
                >
                  {getButtonText(item.status)}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}