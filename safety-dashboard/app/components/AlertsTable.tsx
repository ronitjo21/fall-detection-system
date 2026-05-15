"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"

interface AlertData {
  _id?: string
  workerId: string
  event: string
  severity: string
  timestamp: string
}

export default function AlertsTable() {
  const [alerts, setAlerts] = useState<AlertData[]>([])

  useEffect(() => {
    // 1. FETCH HISTORICAL DATA FROM MONGODB
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/alerts/history")
        const data = await response.json()
        setAlerts(data)
      } catch (err) {
        console.error("Failed to fetch alert history:", err)
      }
    }
    fetchHistory()

    // 2. LISTEN FOR REAL-TIME ALERTS
    const socket = io("http://localhost:5001")
    
    socket.on("critical_alert", (newAlert: AlertData) => {
      // Add new alert to the top and keep the list at a reasonable size
      setAlerts(prev => [newAlert, ...prev].slice(0, 15))
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div className="bg-[#111827] p-8 rounded-2xl border border-gray-700 shadow-xl h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">Recent System Alerts</h2>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 uppercase tracking-widest">
          Live Database Feed
        </span>
      </div>

      <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
        <table className="w-full text-left text-gray-300">
          <thead>
            <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase tracking-wider">
              <th className="pb-4 font-semibold">Worker ID</th>
              <th className="pb-4 font-semibold">Event Type</th>
              <th className="pb-4 font-semibold">Time</th>
              <th className="pb-4 font-semibold">Severity</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-slate-500 italic text-sm">
                  No alerts recorded in database.
                </td>
              </tr>
            ) : (
              alerts.map((alert, index) => (
                <tr key={alert._id || index} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4 font-mono text-sm text-blue-400">{alert.workerId}</td>
                  <td className="py-4 text-sm font-medium">{alert.event}</td>
                  <td className="py-4 text-xs text-slate-500 font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                      alert.severity.toLowerCase() === "critical"
                        ? "bg-red-500/20 text-red-500 animate-pulse border border-red-500/50"
                        : alert.severity.toLowerCase() === "warning" || alert.severity.toLowerCase() === "medium"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}