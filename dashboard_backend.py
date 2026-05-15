"""
Fall Detection Dashboard - FastAPI Backend
Real-time worker safety monitoring with emergency alerts and UWB location tracking
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from datetime import datetime
import asyncio
import json
import random

app = FastAPI(title="Fall Detection Dashboard")

# ─────────────────────────────────────────────
# WORKER STATE
# ─────────────────────────────────────────────
workers = {
    "W001": {"name": "Worker 1", "helmet_id": "H001", "status": "safe", "x": 10, "y": 15, "last_seen": "", "alerts": []},
    "W002": {"name": "Worker 2", "helmet_id": "H002", "status": "safe", "x": 25, "y": 30, "last_seen": "", "alerts": []},
    "W003": {"name": "Worker 3", "helmet_id": "H003", "status": "safe", "x": 40, "y": 20, "last_seen": "", "alerts": []},
}

active_connections: list[WebSocket] = []

# ─────────────────────────────────────────────
# WEBSOCKET MANAGER
# ─────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# ─────────────────────────────────────────────
# API ENDPOINTS
# ─────────────────────────────────────────────
@app.get("/")
async def get_dashboard():
    return HTMLResponse(content=open("dashboard.html").read())

@app.get("/workers")
async def get_workers():
    return workers

@app.post("/alert/{worker_id}")
async def receive_alert(worker_id: str, confidence: float):
    """
    Receives fall alert from ESP32 via HTTP POST.
    In production: ESP32 sends POST request when LSTM detects fall.
    """
    if worker_id in workers:
        workers[worker_id]["status"] = "FALL DETECTED"
        alert = {
            "worker_id": worker_id,
            "worker_name": workers[worker_id]["name"],
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "confidence": round(confidence * 100, 1),
            "location": {
                "x": workers[worker_id]["x"],
                "y": workers[worker_id]["y"]
            },
            "type": "FALL"
        }
        workers[worker_id]["alerts"].append(alert)

        # Broadcast to all dashboard clients
        await manager.broadcast({
            "event": "fall_alert",
            "data": alert
        })

        return {"status": "alert_received", "alert": alert}
    return {"status": "worker_not_found"}


@app.post("/location/{worker_id}")
async def update_location(worker_id: str, x: float, y: float):
    """
    Receives UWB location update from DWM1000 anchor system.
    Coordinates in meters relative to site origin.
    """
    if worker_id in workers:
        workers[worker_id]["x"] = round(x, 2)
        workers[worker_id]["y"] = round(y, 2)
        workers[worker_id]["last_seen"] = datetime.now().strftime("%H:%M:%S")

        await manager.broadcast({
            "event": "location_update",
            "data": {
                "worker_id": worker_id,
                "x": x,
                "y": y,
                "timestamp": workers[worker_id]["last_seen"]
            }
        })
    return {"status": "location_updated"}


@app.post("/clear_alert/{worker_id}")
async def clear_alert(worker_id: str):
    """Mark worker as safe after emergency response."""
    if worker_id in workers:
        workers[worker_id]["status"] = "safe"
        await manager.broadcast({
            "event": "alert_cleared",
            "data": {"worker_id": worker_id}
        })
    return {"status": "cleared"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial state on connect
        await websocket.send_json({
            "event": "init",
            "data": workers
        })
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ─────────────────────────────────────────────
# RUN
# ─────────────────────────────────────────────
# uvicorn dashboard_backend:app --host 0.0.0.0 --port 8000 --reload
