"use client"

import { motion } from "framer-motion"
import { useWorkers } from "../context/WorkerContext"

export default function AlertPopup() {

  const { emergencyActive, stopAlarm } = useWorkers()

  if (!emergencyActive) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-6 right-6 bg-red-600 text-white p-6 rounded-xl shadow-2xl z-50 w-80"
    >
      <h3 className="font-bold text-lg">
        🚨 EMERGENCY ALERT
      </h3>

      <p className="mt-2 text-sm">
        Critical worker detected. Immediate action required.
      </p>

      <div className="mt-4">
        <button
          onClick={stopAlarm}
          className="bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Stop Alarm
        </button>
      </div>
    </motion.div>
  )
}