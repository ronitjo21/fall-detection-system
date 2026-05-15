"use client"

import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { useState } from "react"

export default function SettingsPage() {

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  return (
    <div className="flex bg-white dark:bg-[#0b1220] min-h-screen text-black dark:text-white">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar />

        <div className="p-10">

          <h2 className="text-2xl font-bold mb-8">
            System Settings
          </h2>

          <div className="bg-gray-100 dark:bg-[#111827] p-8 rounded-2xl border border-gray-700 space-y-8">

            {/* Sound Toggle */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Enable Alarm Sound</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Play sound when critical alert occurs
                </p>
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-4 py-2 rounded-lg ${
                  soundEnabled ? "bg-green-600" : "bg-gray-600"
                }`}
              >
                {soundEnabled ? "ON" : "OFF"}
              </button>
            </div>

            {/* Notifications Toggle */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Enable Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive alert notifications
                </p>
              </div>

              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`px-4 py-2 rounded-lg ${
                  notificationsEnabled ? "bg-green-600" : "bg-gray-600"
                }`}
              >
                {notificationsEnabled ? "ON" : "OFF"}
              </button>
            </div>

            {/* System Info */}
            <div>
              <p className="font-semibold mb-2">System Info</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Version: 1.0.0
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Backend Status: Connected
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}