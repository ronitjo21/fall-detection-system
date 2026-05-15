const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  workerId: { 
    type: String, 
    required: true 
  },
  event: { 
    type: String, 
    default: "Fall Detected" 
  },
  severity: { 
    type: String, 
    enum: ['low', 'warning', 'critical'], 
    default: 'critical' 
  },
  // --- ADDED COORDINATES FOR THE ZONE CHART ---
  x: { 
    type: Number 
  },
  y: { 
    type: Number 
  },
  // ------------------------------------------
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Alert', AlertSchema);