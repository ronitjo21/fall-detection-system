"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts"
import { io } from "socket.io-client"

interface AlertData {
  workerId: string
  x?: number
  y?: number
  event: string
}

export default function LiveChart() {
  const [data, setData] = useState([
    { area: "Zone A", falls: 0 },
    { area: "Zone B", falls: 0 },
    { area: "Zone C", falls: 0 },
    { area: "Zone D", falls: 0 },
  ])

  useEffect(() => {
    // 1. FETCH INITIAL COUNTS FROM DB
    const loadHistory = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/alerts/history")
        const alerts: AlertData[] = await res.json()
        processAlerts(alerts)
      } catch (err) {
        console.error("Chart history fetch failed", err)
      }
    }

    // Helper to categorize X/Y into Zones
    const processAlerts = (alerts: AlertData[]) => {
      const counts = { "Zone A": 0, "Zone B": 0, "Zone C": 0, "Zone D": 0 }
      
      alerts.forEach(alert => {
        // Logic: Split the map into 4 quadrants
        if (!alert.x || !alert.y) return;
        if (alert.x < 50 && alert.y < 50) counts["Zone A"]++
        else if (alert.x >= 50 && alert.y < 50) counts["Zone B"]++
        else if (alert.x < 50 && alert.y >= 50) counts["Zone C"]++
        else counts["Zone D"]++
      })

      setData([
        { area: "Zone A", falls: counts["Zone A"] },
        { area: "Zone B", falls: counts["Zone B"] },
        { area: "Zone C", falls: counts["Zone C"] },
        { area: "Zone D", falls: counts["Zone D"] },
      ])
    }

    loadHistory()

    // 2. LISTEN FOR LIVE UPDATES
    const socket = io("http://localhost:5001")
    socket.on("critical_alert", () => {
      // Re-fetch history to update bar heights when a new fall happens
      loadHistory()
    })

    return () => { socket.disconnect() }
  }, [])

  const getColor = (value: number) => {
    if (value >= 5) return "#ef4444" // Dangerous
    if (value >= 2) return "#facc15" // Warning
    return "#10b981" // Safe
  }

  return (
    <div className="bg-[#111827] p-8 rounded-2xl border border-slate-700 shadow-xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Incident Hotspots</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Total Falls Recorded per Zone</p>
        </div>
        <div className="px-3 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400 border border-slate-700">
          DB SYNC ACTIVE
        </div>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="area" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
            />
            <Bar dataKey="falls" radius={[6, 6, 0, 0]} barSize={45}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.falls)} className="transition-all duration-500" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}