
# Fall Detection System (Helmet + Vest)

A real-time safety monitoring system for industrial and construction environments that detects falls and impacts using wearable sensors and machine learning.

## Problem
Workers in hazardous environments are at risk of falls and impacts with no immediate alert system to notify supervisors or emergency responders.

## Tech Stack
Python | ESP32 | MPU6050 | UWB (DWM1000) | LSTM | Random Forest | Machine Learning

## Key Features
- Real-time fall detection using Random Forest for impact classification and LSTM for sequential motion pattern analysis
- Feature engineering on MPU6050 time-series data including windowing, FFT-based frequency features and statistical aggregates
- DWM1000-based UWB indoor positioning for precise location tracking
- Wireless dashboard for live alerts and sensor data transmission

## Results
Achieved real-time anomaly detection on continuous sensor streams with low latency alert generation.

## Status
Hardware implementation complete. Code available on request.
