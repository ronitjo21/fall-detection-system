"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { io } from "socket.io-client" // <-- The Magic Bridge!

export interface Worker {
  id: string
  name: string
  status: "safe" | "warning" | "critical"
  battery: number
  heartRate: number
  active: boolean
  x: number
  y: number
}

interface WorkerContextType {
  workers: Worker[]
  updateWorkerStatus: (id: string, newStatus: "safe" | "warning" | "critical") => void
  toggleWorker: (id: string) => void
  emergencyActive: boolean
  triggerEmergency: () => void
  clearEmergency: () => void
  stopAlarm: () => void
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined)

// Initial state - Everyone starts safe and active
const INITIAL_WORKERS: Worker[] = [
  { id: "W01", name: "Rahul", status: "safe", battery: 85, heartRate: 78, active: true, x: 25, y: 40 },
  { id: "W02", name: "Amit", status: "safe", battery: 42, heartRate: 75, active: true, x: 60, y: 50 },
  { id: "W03", name: "Karan", status: "safe", battery: 67, heartRate: 92, active: true, x: 40, y: 70 }
]

export function WorkerProvider({ children }: { children: ReactNode }) {
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS)
  const [emergencyActive, setEmergencyActive] = useState(false)

  // ==========================================
  // 1. LIVE WEBSOCKET CONNECTION
  // ==========================================
  useEffect(() => {
    // Connect to the Node.js Backend we just started on Port 5001
    const socket = io("http://localhost:5001")

    socket.on("connect", () => {
      console.log("🟢 Connected to Safety Backend WebSocket!")
    })

    // Listen for Live Telemetry (ESP32 sending battery/HR/location updates)
    socket.on("live_telemetry", (data) => {
      setWorkers(prev => prev.map(w => 
        w.id === data.workerId 
          ? { ...w, heartRate: data.heartRate, battery: data.battery, x: data.x, y: data.y } 
          : w
      ))
    })

    // Listen for Critical Alerts (ESP32 detected a fall!)
    socket.on("critical_alert", (data) => {
      setWorkers(prev => prev.map(w => 
        w.id === data.workerId ? { ...w, status: "critical" } : w
      ))
      setEmergencyActive(true) // Instantly trigger global emergency state
    })

    // Cleanup when leaving the dashboard
    return () => {
      socket.disconnect()
    }
  }, [])

  // ==========================================
  // 2. SUPERVISOR & FEED CONTROLS
  // ==========================================

  // Used by the Activity Feed to "Acknowledge" an alert
  const updateWorkerStatus = (id: string, newStatus: "safe" | "warning" | "critical") => {
    setWorkers(prevWorkers => 
      prevWorkers.map(worker => 
        worker.id === id ? { ...worker, status: newStatus } : worker
      )
    )
  }

  // Used by the Supervisor Panel to Disable/Enable a worker's tracking
  const toggleWorker = (id: string) => {
    setWorkers(prev =>
      prev.map(worker =>
        worker.id === id ? { ...worker, active: !worker.active } : worker
      )
    )
  }

  // Used by Supervisor Panel "Trigger Emergency Alert" button
  const triggerEmergency = () => {
    setEmergencyActive(true)
    // Here you could also emit a socket event to tell the ESP32 to sound a buzzer!
  }

  const clearEmergency = () => {
    setEmergencyActive(false)
  }

  // Safely stop the HTML5 Audio tag in the Dashboard without using buggy JS Audio objects
  const stopAlarm = () => {
    setEmergencyActive(false)
    const siren = document.getElementById("emergency-siren") as HTMLAudioElement
    if (siren) {
      siren.pause()
      siren.currentTime = 0
    }
  }

  // 🔥 Auto-trigger global emergency when any active worker goes critical
  useEffect(() => {
    const activeCritical = workers.find(w => w.status === "critical" && w.active)
    if (activeCritical) {
      setEmergencyActive(true)
    } else {
      setEmergencyActive(false)
    }
  }, [workers])

  return (
    <WorkerContext.Provider
      value={{
        workers,
        updateWorkerStatus,
        toggleWorker,
        emergencyActive,
        triggerEmergency,
        clearEmergency,
        stopAlarm
      }}
    >
      {children}
    </WorkerContext.Provider>
  )
}

export function useWorkers() {
  const context = useContext(WorkerContext)
  if (!context) throw new Error("useWorkers must be used inside WorkerProvider")
  return context
}