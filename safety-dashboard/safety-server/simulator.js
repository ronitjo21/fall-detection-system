// simulator.js
// This script pretends to be 3 different ESP32 helmets sending data to your server.

const SERVER_URL = "http://localhost:5001";

// Initial mock state for our 3 workers
let workers = [
  { id: "W01", heartRate: 75, battery: 85, x: 25, y: 40 },
  { id: "W02", heartRate: 72, battery: 42, x: 60, y: 50 }, // Amit
  { id: "W03", heartRate: 90, battery: 67, x: 40, y: 70 }
];

async function sendTelemetry() {
  // 1. Slightly randomize the vitals to make the dashboard look alive
  workers = workers.map(w => ({
    ...w,
    // Heart rate fluctuates by +/- 2 bpm
    heartRate: Math.max(60, Math.min(180, w.heartRate + (Math.floor(Math.random() * 5) - 2))), 
    // Small micro-movements on the X/Y map
    x: w.x + (Math.random() * 2 - 1), 
    y: w.y + (Math.random() * 2 - 1)
  }));

  // 2. Send the data to your Node.js backend
  for (const w of workers) {
    try {
      await fetch(`${SERVER_URL}/api/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: w.id, heartRate: w.heartRate, battery: w.battery, x: w.x, y: w.y })
      });
      console.log(`📡 Sent vitals for ${w.id} -> HR: ${w.heartRate} bpm`);
    } catch (e) {
      console.log(`❌ Server offline. Is safety-server running?`);
      return; // Stop trying if server is dead
    }
  }
  console.log("-----------------------------------");
}

async function triggerEmergency(worker) {
  // Randomize the drop location across the 0-100 map to test all Zones!
  const dropX = Math.floor(Math.random() * 100);
  const dropY = Math.floor(Math.random() * 100);

  console.log(`\n🚨 SIMULATING CRITICAL FALL FOR ${worker.id} AT X:${dropX}, Y:${dropY}!\n`);
  
  try {
    await fetch(`${SERVER_URL}/api/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        workerId: worker.id, 
        event: "Fall Detected", 
        severity: "critical",
        x: dropX,  // <-- We are now sending the random X coordinate
        y: dropY   // <-- We are now sending the random Y coordinate
      })
    });
  } catch (e) {
    console.log(`❌ Failed to send alert.`);
  }
}

console.log("🤖 IoT Hardware Simulator Started!");
console.log("Sending normal vitals every 3 seconds. Watch your dashboard...");

// Send normal telemetry every 3 seconds
setInterval(sendTelemetry, 3000);
sendTelemetry(); // Fire the first batch immediately

// --- THE CHAOS PROTOCOL ---
// Every 15 seconds, pick a random worker and trigger a fall in a random zone
setInterval(() => {
  const randomWorker = workers[Math.floor(Math.random() * workers.length)];
  triggerEmergency(randomWorker);
}, 15000);