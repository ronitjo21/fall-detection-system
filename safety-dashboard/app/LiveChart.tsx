"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

const data = [
  { area: "Zone A", falls: 2 },
  { area: "Zone B", falls: 5 },
  { area: "Zone C", falls: 7 },
  { area: "Zone D", falls: 1 },
]

export default function LiveChart() {
  return (
    <div className="bg-gray-100 dark:bg-[#111827] p-6 rounded-2xl border border-gray-700">

      <h2 className="text-lg font-semibold mb-4">
        🚨 FALLS PER AREA (TEST VERSION)
      </h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="area" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip />
            <Bar
              dataKey="falls"
              fill="#ef4444"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}