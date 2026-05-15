"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"

interface PredictionData {
  title: string
  message: string
  level: "low" | "warning" | "critical"
}

export default function AIPrediction() {
  const [prediction, setPrediction] = useState<PredictionData>({
    title: "Analyzing Site Data...",
    message: "Gathering telemetry for risk assessment.",
    level: "low"
  })

  useEffect(() => {
    // Connect to your Node.js backend
    const socket = io("http://localhost:5001")

    // Listen for the AI Engine's updates
    socket.on("ai_prediction", (data: PredictionData) => {
      setPrediction(data)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Dynamic styling helpers based on the risk level
  const getHeaderStyle = (level: string) => {
    if (level === "critical") return "text-red-500"
    if (level === "warning") return "text-orange-400"
    return "text-emerald-400"
  }

  const getProgressStyle = (level: string) => {
    if (level === "critical") return "bg-red-500 w-[94%]"
    if (level === "warning") return "bg-orange-400 w-[82%]"
    return "bg-emerald-500 w-[98%]"
  }

  const getGlowStyle = (level: string) => {
    if (level === "critical") return "bg-red-500/10"
    if (level === "warning") return "bg-orange-500/10"
    return "bg-emerald-500/5"
  }

  return (
    <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 shadow-lg h-[400px] flex flex-col relative overflow-hidden">
      
      {/* Subtle background glow that changes color based on risk */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full transition-colors duration-1000 ${getGlowStyle(prediction.level)}`}></div>

      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-3 relative z-10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          🧠 AI Risk Engine
        </h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Processing</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <h4 className={`text-xl font-bold mb-3 transition-colors duration-500 ${getHeaderStyle(prediction.level)}`}>
          {prediction.title}
        </h4>
        <p className="text-slate-400 text-sm leading-relaxed transition-colors duration-500">
          {prediction.message}
        </p>

        {/* Visual Data Representation */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
           <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              <span>Confidence Score</span>
              <span className={`font-bold ${getHeaderStyle(prediction.level)}`}>
                 {prediction.level === 'low' ? '98%' : prediction.level === 'warning' ? '82%' : '94%'}
              </span>
           </div>
           {/* Progress Bar */}
           <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full transition-all duration-1000 ${getProgressStyle(prediction.level)}`}
              ></div>
           </div>
        </div>
      </div>

    </div>
  )
}