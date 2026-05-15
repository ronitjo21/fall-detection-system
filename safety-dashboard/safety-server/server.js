const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Alert = require('./models/Alert'); // Ensure this file exists in /models/Alert.js

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// 1. DATABASE CONNECTION
// Added "safety_db" to the end so it creates a specific database for your project
const MONGO_URI = "mongodb://localhost:27017/safety_db"; 

mongoose.connect(MONGO_URI)
  .then(() => console.log("💾 MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 2. SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let lastKnownTelemetry = {}; 

io.on('connection', (socket) => {
  console.log(`🟢 Dashboard Connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`🔴 Dashboard Disconnected`));
});

// ==========================================
// 3. API ENDPOINTS
// ==========================================

// GET HISTORY: Fetch last 20 alerts from MongoDB
app.get('/api/alerts/history', async (req, res) => {
  try {
    const history = await Alert.find().sort({ timestamp: -1 }).limit(20);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NEW: CLEAR DATABASE ROUTE ---
// Wipes all alerts (Great for testing and resetting before demos)
app.get('/api/alerts/clear', async (req, res) => {
  try {
    await Alert.deleteMany({}); // Deletes everything in the collection
    console.log("🧹 DATABASE CLEARED: All alerts wiped!");
    
    // Optional: Tells the dashboard a wipe happened
    io.emit('database_cleared'); 
    
    res.json({ success: true, message: "Database completely cleared." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ---------------------------------

// TELEMETRY: Real-time vitals
app.post('/api/telemetry', (req, res) => {
  const { workerId } = req.body;
  lastKnownTelemetry[workerId] = req.body; // Store for AI Engine
  
  io.emit('live_telemetry', req.body);
  res.status(200).json({ success: true });
});

// EMERGENCY: Fall Alerts (Saves to MongoDB with X/Y Coordinates)
app.post('/api/alert', async (req, res) => {
  // Extract x and y from the incoming request body
  const { workerId, event, severity, x, y } = req.body;
  
  try {
    // Save record to MongoDB permanently, including coordinates
    const newAlert = new Alert({
      workerId,
      event: event || "Fall Detected",
      severity: severity || "critical",
      x: x || 50, // Default to middle of map if missing
      y: y || 50, // Default to middle of map if missing
      timestamp: new Date()
    });
    await newAlert.save();

    console.log(`🚨 ALERT SAVED: ${workerId} at Zone (X:${newAlert.x}, Y:${newAlert.y})`);

    // Push to Dashboard
    io.emit('critical_alert', newAlert); 
    res.status(200).json({ success: true, db_id: newAlert._id });
  } catch (err) {
    console.error("Failed to save alert:", err);
    res.status(500).json({ success: false });
  }
});

// ==========================================
// 4. AI RISK PREDICTION ENGINE
// ==========================================
setInterval(() => {
  const workers = Object.values(lastKnownTelemetry);
  if (workers.length === 0) return;

  let riskMsg = "Site operations normal. No elevated risks predicted.";
  let riskLevel = "low";
  let title = "Safe Zone";

  const stressedWorkers = workers.filter(w => w.heartRate > 95); // High heart rate check
  if (stressedWorkers.length >= 2) {
    riskLevel = "warning";
    title = "High Heat Stress";
    riskMsg = "Multiple workers showing high heart rates in same sector.";
  }

  const dyingHelmets = workers.filter(w => w.battery < 20);
  if (dyingHelmets.length > 0) {
    riskLevel = "critical";
    title = "Hardware Critical";
    riskMsg = `Worker ${dyingHelmets[0].workerId} helmet battery critically low.`;
  }

  io.emit('ai_prediction', { title, message: riskMsg, level: riskLevel });
}, 10000);

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`🚀 Safety Backend running on http://localhost:${PORT}`);
});