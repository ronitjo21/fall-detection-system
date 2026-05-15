"use client"

import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { useWorkers } from "../context/WorkerContext"

export default function WorkersPage() {

  const { workers, toggleWorker } = useWorkers()

  return (
    <div className="flex bg-white dark:bg-[#0b1220] min-h-screen text-black dark:text-white">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar />

        <div className="p-10">

          <h2 className="text-2xl font-bold mb-8">
            Workers Management
          </h2>

          <div className="bg-gray-100 dark:bg-[#111827] rounded-2xl border border-gray-700">

            {workers.map(worker => (
              <div
                key={worker.id}
                className="flex justify-between items-center p-6 border-b border-gray-700"
              >

                <div>
                  <p className="font-semibold">
                    {worker.name} ({worker.id})
                  </p>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Battery: {worker.battery}% | Heart: {worker.heartRate} bpm
                  </p>
                </div>

                <div className="flex items-center gap-4">

                  {!worker.active ? (
                    <span className="text-gray-400 font-semibold">
                      OFFLINE
                    </span>
                  ) : (
                    <span className={
                      worker.status === "critical"
                        ? "text-red-500"
                        : worker.status === "warning"
                        ? "text-yellow-400"
                        : "text-green-400"
                    }>
                      {worker.status.toUpperCase()}
                    </span>
                  )}

                  <button
                    onClick={() => toggleWorker(worker.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      worker.active
                        ? "bg-green-600"
                        : "bg-gray-600"
                    }`}
                  >
                    {worker.active ? "Disable" : "Enable"}
                  </button>

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  )
}