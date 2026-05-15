"use client"

import { useState } from "react"

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  return (
    <button
      onClick={() => setDark(!dark)}
      className="bg-gray-700 px-3 py-2 rounded-lg text-sm"
    >
      {dark ? "🌙 Dark" : "☀ Light"}
    </button>
  )
}