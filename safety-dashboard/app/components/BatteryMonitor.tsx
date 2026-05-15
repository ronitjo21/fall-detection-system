export default function BatteryMonitor() {

  const devices = [
    { id: "W01", level: 85 },
    { id: "W02", level: 42 },
    { id: "W03", level: 67 },
  ]

  return (
    <div className="bg-[#111827] p-6 rounded-2xl border border-gray-700">

      <h2 className="text-lg font-semibold mb-4">
        Device Battery Status
      </h2>

      {devices.map((device) => (
        <div key={device.id} className="mb-4">

          <div className="flex justify-between text-sm mb-1">
            <span>{device.id}</span>
            <span>{device.level}%</span>
          </div>

          <div className="w-full bg-gray-700 h-2 rounded-full">
            <div
              className={`h-2 rounded-full ${
                device.level < 50 ? "bg-red-500" : "bg-green-500"
              }`}
              style={{ width: `${device.level}%` }}
            ></div>
          </div>

        </div>
      ))}

    </div>
  )
}