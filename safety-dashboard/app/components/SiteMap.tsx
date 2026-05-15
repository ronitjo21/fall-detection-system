"use client"

import { useWorkers } from "../context/WorkerContext"

interface SiteMapProps {
  onWorkerClick?: (workerId: string) => void;
}

const ZONES = [
  { id: "Zone A (Crane)", x: 25, y: 35, radius: 18 },
  { id: "Zone B (Scaffolding)", x: 75, y: 30, radius: 15 },
  { id: "Zone C (Excavation)", x: 50, y: 75, radius: 20 },
]

export default function SiteMap({ onWorkerClick }: SiteMapProps) {
  const { workers } = useWorkers()
  const activeWorkers = workers.filter(worker => worker.active)

  // UPDATED: High-contrast, darker zone colors with blur effects
  const getZoneColor = (zone: typeof ZONES[0]) => {
    const workersInZone = activeWorkers.filter(w => {
      const dx = w.x - zone.x;
      const dy = w.y - zone.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= zone.radius;
    });

    if (workersInZone.some(w => w.status === "critical")) {
      return "bg-red-600/70 border-red-500 border-4 animate-pulse ring-4 ring-red-600/50 backdrop-blur-sm";
    }
    if (workersInZone.some(w => w.status === "warning")) {
      return "bg-orange-600/70 border-orange-500 border-4 backdrop-blur-[2px]";
    }
    return "bg-emerald-600/30 border-emerald-500/60 border-2"; 
  }

  // Breadcrumb Simulation Generator
  const getSimulatedHistory = (worker: any) => {
    if (worker.history && worker.history.length > 0) return worker.history;

    const history = [];
    for (let i = 1; i <= 5; i++) {
      const isErratic = worker.status !== "safe";
      const offsetX = isErratic ? Math.sin(i * 1.5) * 3 : i * 2.5; 
      const offsetY = isErratic ? Math.cos(i * 1.5) * 3 : i * 1.2;
      
      history.push({
        x: worker.x - offsetX,
        y: worker.y + offsetY,
        opacity: 1 - (i * 0.15)
      });
    }
    return history;
  }

  return (
    <div className="bg-[#111827] p-8 rounded-2xl border border-slate-700 shadow-lg col-span-2">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Live Site Map & Risk Heatmap</h2>
        <div className="flex gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1 text-emerald-400"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div> Safe</span>
          <span className="flex items-center gap-1 text-orange-400"><div className="w-2 h-2 bg-orange-500 rounded-full"></div> Warning</span>
          <span className="flex items-center gap-1 text-red-500"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> Critical</span>
        </div>
      </div>

      <div
        className="relative w-full h-[450px] bg-[#1f2937] bg-cover bg-center border-2 border-slate-600 rounded-xl overflow-hidden"
        style={{ 
          // UPDATED: Darker RGB values for the grid lines
          backgroundImage: `
            linear-gradient(to right, rgba(15, 23, 42, 0.8) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(15, 23, 42, 0.8) 1px, transparent 1px), 
            url('/blueprint.jpg')
          `,
          backgroundSize: '40px 40px, 40px 40px, cover'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent pointer-events-none z-0"></div>

        {/* Render the Heatmap Zones (Z-index 10) */}
        {ZONES.map(zone => {
          const colorClass = getZoneColor(zone);
          return (
            <div
              key={zone.id}
              className={`absolute rounded-full transition-all duration-700 pointer-events-none flex items-center justify-center z-10 ${colorClass}`}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.radius * 2}%`,
                height: `${zone.radius * 2}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest text-center px-2">
                {zone.id}
              </span>
            </div>
          )
        })}

        {/* Render the Workers and their Breadcrumbs (Z-index 20) */}
        {activeWorkers.map((worker) => {
          const historyTrail = getSimulatedHistory(worker);

          return (
            <div key={`worker-group-${worker.id}`}>
              
              {/* Render Breadcrumb Trail */}
              {historyTrail.map((point: any, index: number) => (
                <div
                  key={`trail-${worker.id}-${index}`}
                  className={`absolute w-1.5 h-1.5 rounded-full pointer-events-none z-10 ${
                    worker.status === "critical" ? "bg-red-400" : 
                    worker.status === "warning" ? "bg-orange-400" : "bg-emerald-400"
                  }`}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    opacity: point.opacity,
                    transform: "translate(-50%, -50%)"
                  }}
                ></div>
              ))}

              {/* Main Worker Dot */}
              <div
                onClick={() => onWorkerClick && onWorkerClick(worker.id)}
                className="absolute group flex flex-col items-center cursor-pointer hover:scale-125 transition-transform z-20"
                style={{
                  left: `${worker.x}%`,
                  top: `${worker.y}%`,
                  transform: "translate(-50%, -50%)"
                }}
              >
                <div className="relative">
                  {worker.status === "critical" && (
                    <div className="absolute -inset-2 bg-red-500 rounded-full animate-ping opacity-75"></div>
                  )}
                  <div
                    className={`relative w-5 h-5 rounded-full border-2 border-[#111827] shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors ${
                      worker.status === "critical"
                        ? "bg-red-500"
                        : worker.status === "warning"
                        ? "bg-orange-500"
                        : "bg-emerald-400"
                    }`}
                  ></div>
                </div>

                <span className="text-xs mt-1 font-bold bg-[#111827]/80 px-2 py-0.5 rounded text-white border border-slate-600">
                  {worker.id}
                </span>

                <div className="absolute bottom-10 hidden group-hover:block bg-[#1f2937] text-white text-xs rounded-lg p-3 border border-slate-600 shadow-2xl w-48 pointer-events-none z-50">
                  <div className="border-b border-slate-600 pb-2 mb-2">
                    <p className="font-bold text-sm text-blue-400">{worker.name}</p>
                    <p className="text-slate-400 uppercase tracking-wider text-[10px]">{worker.status} STATUS</p>
                  </div>
                  <div className="space-y-1">
                    <p className="flex justify-between"><span>Battery:</span> <span className="font-mono text-emerald-400">{worker.battery}%</span></p>
                    <p className="flex justify-between"><span>Heart Rate:</span> <span className="font-mono text-red-400">{worker.heartRate} BPM</span></p>
                  </div>
                  <p className="mt-2 text-[10px] text-center text-slate-400 italic">Click to view full vitals</p>
                </div>
              </div>

            </div>
          )
        })}

        {activeWorkers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-bold tracking-widest uppercase">
            No Active Transmissions Detected
          </div>
        )}
      </div>
    </div>
  )
}