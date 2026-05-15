"use client"

import React from "react"
import { useWorkers } from "../context/WorkerContext" // <-- Hooking into our live data!

export default function WorkerModal({ workerId, onClose }: { workerId: string, onClose: () => void }) {
  const { workers } = useWorkers()
  
  // Find the exact worker we clicked on
  const worker = workers.find(w => w.id === workerId)

  // If for some reason the worker isn't found, don't crash
  if (!worker) return null; 

  // Derive visual styles based on the worker's current safety status
  const isCritical = worker.status === "critical";
  const isWarning = worker.status === "warning";
  
  const statusColor = isCritical ? "text-red-400" : isWarning ? "text-orange-400" : "text-emerald-400";
  const pulseColor = isCritical ? "bg-red-500 animate-pulse" : isWarning ? "bg-orange-500" : "bg-emerald-500";

  // Mocking a temperature based on status (since temp isn't in our Context yet)
  const temp = isCritical ? 38.1 : isWarning ? 37.6 : 37.2;
  const activity = isCritical ? "Fall Detected / Critical" : isWarning ? "Proximity Warning" : "Routine Work";
  
  // Format the raw X/Y percentages into readable coordinates
  const location = `X: ${Math.round(worker.x)}, Y: ${Math.round(worker.y)}`;

  return (
    // Note: z-[99999] ensures it stays above the Red Emergency Glow
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-slate-700 w-[500px] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* --- PREMIUM HEADER --- */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50">
          <div>
            <h2 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-sm">
              Worker Diagnostics
            </h2>
            <p className="text-slate-400 font-mono text-sm mt-1">
              ID: <span className="text-white font-bold">{worker.id}</span> | {worker.name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-full transition-all"
          >
            ✕
          </button>
        </div>

        {/* Vitals Grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            
            {/* Heart Rate Card - Border turns red if critical! */}
            <div className={`bg-[#1f2937] p-4 rounded-xl border ${isCritical ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-600'} flex flex-col items-center justify-center relative overflow-hidden transition-all`}>
              <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${pulseColor}`}></div>
              <span className="text-slate-400 text-sm font-semibold uppercase mb-1">Heart Rate</span>
              <span className="text-4xl font-black text-white flex items-baseline gap-1">
                {worker.heartRate} <span className="text-sm font-normal text-slate-400">BPM</span>
              </span>
            </div>

            {/* Temperature Card */}
            <div className="bg-[#1f2937] p-4 rounded-xl border border-slate-600 flex flex-col items-center justify-center">
              <span className="text-slate-400 text-sm font-semibold uppercase mb-1">Body Temp</span>
              <span className="text-4xl font-black text-white flex items-baseline gap-1">
                {temp} <span className="text-sm font-normal text-slate-400">°C</span>
              </span>
            </div>
          </div>

          {/* Context Info */}
          <div className="space-y-3 bg-[#1f2937] p-4 rounded-xl border border-slate-600">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Current Status:</span>
              <span className={`font-bold ${statusColor} uppercase tracking-wider`}>{activity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Live Coordinates:</span>
              <span className="font-semibold text-white font-mono">{location}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Helmet Battery:</span>
              <span className={`font-semibold ${worker.battery < 20 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {worker.battery}%
              </span>
            </div>
          </div>

          {/* --- PREMIUM ACTION BUTTONS --- */}
          <div className="flex gap-3 pt-2">
            <button className="flex-1 bg-blue-600 border border-blue-500 hover:bg-blue-500 text-white py-2.5 rounded-lg font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]">
              Initiate Radio Comms
            </button>
            <button className="flex-1 bg-slate-700 border border-slate-600 hover:bg-slate-600 text-white py-2.5 rounded-lg font-bold tracking-wide transition-all">
              View Medical History
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}