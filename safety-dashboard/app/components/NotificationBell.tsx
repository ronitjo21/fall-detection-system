"use client"

import { useState } from "react"
import { Bell } from "lucide-react"

export default function NotificationBell() {

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Fall detected - Worker W02",
      time: "2 mins ago"
    }
  ])

  const [open, setOpen] = useState(false)

  return (
    <div className="relative">

      {/* Bell Icon */}
      <div
        className="cursor-pointer relative"
        onClick={() => setOpen(!open)}
      >
        <Bell size={22} />

        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-4 w-80 bg-[#111827] border border-gray-700 rounded-xl shadow-lg p-4">

          <h3 className="text-sm font-semibold mb-3">
            Notifications
          </h3>

          {notifications.map((note) => (
            <div
              key={note.id}
              className="border-b border-gray-700 pb-3 mb-3"
            >
              <p className="text-sm text-white">
                {note.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {note.time}
              </p>
            </div>
          ))}

        </div>
      )}

    </div>
  )
}