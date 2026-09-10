# Smart IoT Water Monitoring System

Features: two real-time tanks, Firebase, overflow alert, voice alerts, sensor status, notification history, animated water waves, history chart, demo/live mode, equipment status and automatic/manual motor control.

Render:
- Service Type: Web Service
- Root Directory: leave empty
- Build Command: npm install
- Start Command: node server.js

Firebase test data:
waterLevels
- tank1: 75
- tank2: 45

For real equipment later also send:
- waterLevels/lastUpdated: current timestamp in milliseconds
- deviceStatus/arduino
- deviceStatus/esp8266
- deviceStatus/tank1Sensor
- deviceStatus/tank2Sensor

Planned equipment: Arduino Uno, ESP8266, 2 HC-SR04 sensors, buzzer, breadboard, jumper wires and USB cable. Real AC motor requires an appropriate relay and electrical safety.
