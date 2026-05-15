"""
Fall Detection System - Helmet Module
Dataset: SisFall (Hybrid - Falls + ADL Activities)
Model: LSTM for sequential motion pattern analysis
Hardware: ESP32 + MPU6050 + UWB (DWM1000)
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import joblib
import os

# ─────────────────────────────────────────────
# 1. CONFIGURATION
# ─────────────────────────────────────────────
WINDOW_SIZE = 200       # 200 samples per window (~2 seconds at 100Hz)
STEP_SIZE = 100         # 50% overlap
NUM_FEATURES = 6        # AccX, AccY, AccZ, GyroX, GyroY, GyroZ
NUM_CLASSES = 2         # 0 = Normal, 1 = Fall
BATCH_SIZE = 32
EPOCHS = 30
LEARNING_RATE = 0.001
HIDDEN_SIZE = 128
NUM_LAYERS = 2
DROPOUT = 0.3
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"Using device: {DEVICE}")

# ─────────────────────────────────────────────
# 2. DATA LOADING (SisFall Dataset)
# ─────────────────────────────────────────────
def load_sisfall_data(data_dir="sisfall_data"):
    """
    Load SisFall dataset.
    Falls: F01-F15 (15 fall types)
    ADL:   D01-D19 (19 daily activities)
    Each file: columns = [AccADXL_X, AccADXL_Y, AccADXL_Z, AccMMA_X, AccMMA_Y, AccMMA_Z, Gyro_X, Gyro_Y, Gyro_Z]
    We use ADXL345 accelerometer + ITG3200 gyroscope (6 features)
    """
    X_data, y_data = [], []

    if not os.path.exists(data_dir):
        print("SisFall data directory not found. Generating synthetic data for demo...")
        return generate_synthetic_sisfall()

    for subject in range(1, 24):  # SA01 to SA23
        subject_dir = os.path.join(data_dir, f"SA{subject:02d}")
        if not os.path.exists(subject_dir):
            continue

        for file in os.listdir(subject_dir):
            filepath = os.path.join(subject_dir, file)
            label = 1 if file.startswith("F") else 0  # F = Fall, D = Daily Activity

            try:
                df = pd.read_csv(filepath, header=None)
                # Use AccADXL (cols 0,1,2) and Gyro (cols 6,7,8)
                data = df.iloc[:, [0, 1, 2, 6, 7, 8]].values.astype(np.float32)
                windows = sliding_window(data, WINDOW_SIZE, STEP_SIZE)
                X_data.extend(windows)
                y_data.extend([label] * len(windows))
            except Exception as e:
                print(f"Error reading {filepath}: {e}")

    return np.array(X_data), np.array(y_data)


def generate_synthetic_sisfall():
    """Generate synthetic SisFall-like data for demonstration."""
    np.random.seed(42)
    X, y = [], []

    # Normal activity samples
    for _ in range(500):
        # Low amplitude, smooth motion
        t = np.linspace(0, 2, WINDOW_SIZE)
        acc = np.column_stack([
            np.sin(2 * np.pi * t) + np.random.normal(0, 0.1, WINDOW_SIZE),
            np.cos(2 * np.pi * t) + np.random.normal(0, 0.1, WINDOW_SIZE),
            9.8 + np.random.normal(0, 0.2, WINDOW_SIZE),
            np.random.normal(0, 0.5, WINDOW_SIZE),
            np.random.normal(0, 0.5, WINDOW_SIZE),
            np.random.normal(0, 0.5, WINDOW_SIZE),
        ])
        X.append(acc)
        y.append(0)

    # Fall samples
    for _ in range(500):
        # High amplitude spike then low activity (impact + lying still)
        t = np.linspace(0, 2, WINDOW_SIZE)
        impact_point = WINDOW_SIZE // 3

        acc_x = np.concatenate([
            np.random.normal(0, 0.3, impact_point),
            np.random.normal(0, 8, 20),   # Impact spike
            np.random.normal(0, 0.2, WINDOW_SIZE - impact_point - 20)
        ])
        acc_y = np.concatenate([
            np.random.normal(0, 0.3, impact_point),
            np.random.normal(0, 6, 20),
            np.random.normal(0, 0.2, WINDOW_SIZE - impact_point - 20)
        ])
        acc_z = np.concatenate([
            9.8 + np.random.normal(0, 0.2, impact_point),
            np.random.normal(0, 5, 20),
            np.random.normal(0, 0.5, WINDOW_SIZE - impact_point - 20)
        ])
        gyro = np.random.normal(0, 2, (WINDOW_SIZE, 3))

        fall_sample = np.column_stack([acc_x, acc_y, acc_z, gyro])
        X.append(fall_sample.astype(np.float32))
        y.append(1)

    return np.array(X), np.array(y)


# ─────────────────────────────────────────────
# 3. PREPROCESSING
# ─────────────────────────────────────────────
def sliding_window(data, window_size, step_size):
    """Extract sliding windows from time-series data."""
    windows = []
    for start in range(0, len(data) - window_size + 1, step_size):
        windows.append(data[start:start + window_size])
    return windows


def extract_features_fft(windows):
    """
    Extract FFT-based frequency features from each window.
    Appends frequency domain features to time domain for richer representation.
    """
    enriched = []
    for w in windows:
        fft_features = np.abs(np.fft.fft(w, axis=0)[:window_size // 2])
        # Statistical features
        mean = np.mean(w, axis=0)
        std = np.std(w, axis=0)
        max_val = np.max(w, axis=0)
        # Signal Magnitude Area (SMA) - classic fall detection feature
        sma = np.sum(np.abs(w[:, :3])) / len(w)
        enriched.append(w)  # For LSTM we use raw windowed signal
    return np.array(enriched)


def preprocess_data(X, y):
    """Scale features and prepare for LSTM."""
    n_samples, n_timesteps, n_features = X.shape

    # Reshape for scaling: (samples * timesteps, features)
    X_reshaped = X.reshape(-1, n_features)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_reshaped)
    X_scaled = X_scaled.reshape(n_samples, n_timesteps, n_features)

    return X_scaled, y, scaler


# ─────────────────────────────────────────────
# 4. LSTM MODEL
# ─────────────────────────────────────────────
class FallDetectionLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, num_classes, dropout):
        super(FallDetectionLSTM, self).__init__()

        self.hidden_size = hidden_size
        self.num_layers = num_layers

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0,
            bidirectional=False
        )

        self.attention = nn.Linear(hidden_size, 1)

        self.classifier = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        # x: (batch, timesteps, features)
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(DEVICE)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(DEVICE)

        out, _ = self.lstm(x, (h0, c0))
        # out: (batch, timesteps, hidden_size)

        # Attention mechanism
        attn_weights = torch.softmax(self.attention(out), dim=1)
        context = torch.sum(attn_weights * out, dim=1)

        logits = self.classifier(context)
        return logits


# ─────────────────────────────────────────────
# 5. TRAINING
# ─────────────────────────────────────────────
def train_model(model, train_loader, val_loader, criterion, optimizer, epochs):
    best_val_acc = 0
    history = {"train_loss": [], "val_loss": [], "val_acc": []}

    for epoch in range(epochs):
        model.train()
        train_loss = 0

        for X_batch, y_batch in train_loader:
            X_batch, y_batch = X_batch.to(DEVICE), y_batch.to(DEVICE)
            optimizer.zero_grad()
            outputs = model(X_batch)
            loss = criterion(outputs, y_batch)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            train_loss += loss.item()

        # Validation
        model.eval()
        val_loss, correct, total = 0, 0, 0
        with torch.no_grad():
            for X_batch, y_batch in val_loader:
                X_batch, y_batch = X_batch.to(DEVICE), y_batch.to(DEVICE)
                outputs = model(X_batch)
                val_loss += criterion(outputs, y_batch).item()
                _, predicted = torch.max(outputs, 1)
                correct += (predicted == y_batch).sum().item()
                total += y_batch.size(0)

        val_acc = correct / total
        avg_train_loss = train_loss / len(train_loader)
        avg_val_loss = val_loss / len(val_loader)

        history["train_loss"].append(avg_train_loss)
        history["val_loss"].append(avg_val_loss)
        history["val_acc"].append(val_acc)

        print(f"Epoch [{epoch+1}/{epochs}] "
              f"Train Loss: {avg_train_loss:.4f} | "
              f"Val Loss: {avg_val_loss:.4f} | "
              f"Val Acc: {val_acc:.4f}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), "best_fall_detection_model.pth")

    print(f"\nBest Validation Accuracy: {best_val_acc:.4f}")
    return history


# ─────────────────────────────────────────────
# 6. REAL-TIME INFERENCE
# ─────────────────────────────────────────────
class RealTimeFallDetector:
    """
    Simulates real-time inference from ESP32 MPU6050 sensor stream.
    In production, sensor data arrives via serial/WiFi from ESP32.
    """
    def __init__(self, model, scaler, threshold=0.7):
        self.model = model
        self.scaler = scaler
        self.threshold = threshold
        self.buffer = []
        self.model.eval()

    def add_sample(self, acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z):
        """Add one sensor reading to the buffer."""
        self.buffer.append([acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z])

        if len(self.buffer) >= WINDOW_SIZE:
            return self.predict_window()
        return None

    def predict_window(self):
        """Run inference on current buffer window."""
        window = np.array(self.buffer[-WINDOW_SIZE:], dtype=np.float32)
        window_scaled = self.scaler.transform(window)
        tensor = torch.FloatTensor(window_scaled).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            output = self.model(tensor)
            prob = torch.softmax(output, dim=1)[0][1].item()

        is_fall = prob >= self.threshold
        return {"fall_detected": is_fall, "confidence": prob}


# ─────────────────────────────────────────────
# 7. MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("Loading SisFall dataset...")
    X, y = load_sisfall_data()
    print(f"Dataset: {X.shape[0]} samples, {X.shape[1]} timesteps, {X.shape[2]} features")
    print(f"Falls: {sum(y == 1)} | Normal: {sum(y == 0)}")

    print("\nPreprocessing...")
    X_scaled, y, scaler = preprocess_data(X, y)
    joblib.dump(scaler, "scaler.pkl")

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    # Convert to tensors
    X_train_t = torch.FloatTensor(X_train)
    y_train_t = torch.LongTensor(y_train)
    X_test_t = torch.FloatTensor(X_test)
    y_test_t = torch.LongTensor(y_test)

    train_loader = DataLoader(TensorDataset(X_train_t, y_train_t), batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(TensorDataset(X_test_t, y_test_t), batch_size=BATCH_SIZE)

    print("\nBuilding LSTM model...")
    model = FallDetectionLSTM(
        input_size=NUM_FEATURES,
        hidden_size=HIDDEN_SIZE,
        num_layers=NUM_LAYERS,
        num_classes=NUM_CLASSES,
        dropout=DROPOUT
    ).to(DEVICE)

    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=3)

    print("\nTraining...")
    history = train_model(model, train_loader, val_loader, criterion, optimizer, EPOCHS)

    # Final evaluation
    model.load_state_dict(torch.load("best_fall_detection_model.pth"))
    model.eval()
    all_preds, all_labels = [], []

    with torch.no_grad():
        for X_batch, y_batch in val_loader:
            X_batch = X_batch.to(DEVICE)
            outputs = model(X_batch)
            _, predicted = torch.max(outputs, 1)
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(y_batch.numpy())

    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, target_names=["Normal", "Fall"]))

    print("\nReal-time inference demo:")
    detector = RealTimeFallDetector(model, scaler)
    # Simulate fall event
    for i in range(WINDOW_SIZE):
        if i == 150:  # Simulate impact
            result = detector.add_sample(12.5, -8.3, 2.1, 5.2, -3.1, 7.8)
        else:
            result = detector.add_sample(0.1, 0.2, 9.8, 0.0, 0.0, 0.0)
        if result:
            print(f"Fall Detected: {result['fall_detected']} | Confidence: {result['confidence']:.3f}")
