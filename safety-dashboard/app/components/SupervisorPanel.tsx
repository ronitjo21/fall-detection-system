"use client"

import { useWorkers } from "../context/WorkerContext"

export default function SupervisorPanel() {

  const { workers, toggleWorker, triggerEmergency } = useWorkers()

  return (
    <div className="bg-gray-100 dark:bg-[#111827] p-8 rounded-2xl border border-gray-300 dark:border-gray-700">

      <h2 className="text-lg font-semibold mb-6">
        Supervisor Control Panel
      </h2>

      {workers.map((worker) => (
        <div
          key={worker.id}
          className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 py-4"
        >

          <div>
            <p className="font-medium">
              {worker.name} ({worker.id})
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {worker.active ? "Active" : "Offline"}
            </p>
          </div>

          <button
            onClick={() => toggleWorker(worker.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              worker.active
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            {worker.active ? "Disable" : "Enable"}
          </button>

        </div>
      ))}

      <button
        onClick={triggerEmergency}
        className="mt-6 w-full bg-red-600 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all text-white"
      >
        Trigger Emergency Alert
      </button>

    </div>
  )
}