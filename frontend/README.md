# ⚡ SmartFit AI — Frontend Web Application

This directory contains the interactive, responsive user interface for **SmartFit AI**, built using **React 18** and **Vite**. It provides real-time video streaming, biomechanical analytics dashboards, and interactive workout feedback.

---

## **🛠️ Tech Stack & Architecture**
* **Framework:** React 18 (with Vite fast bundling & HMR)
* **Routing:** React Router DOM (Single Page Application architecture)
* **Styling:** Modern Vanilla CSS with custom design tokens, glassmorphism, and responsive CSS Grid/Flexbox layouts
* **HTTP Client:** Native Fetch API with asynchronous state handling and real-time backend health polling
* **Video Handling:** HTML5 Canvas & Video APIs for live webcam frame capture and multipart video uploading

---

## **✨ Key Features & Components**
* **🔴 Live AI Workout Studio (`/playground`):** Captures live webcam streams, transmits frame data to the Python edge backend, and renders real-time MediaPipe skeleton overlays, joint angle trigonometry displays, and rep counters.
* **📤 Video Upload Analysis (`/upload`):** Allows users to upload pre-recorded workout videos (`.mp4`) for automated biomechanical evaluation and form grading.
* **🟢 Real-time Backend Health Indicator:** A dynamic navigation badge that continuously polls the Python Flask API to display connection status (Connected / Unreachable).

---

## **🚀 Local Development Setup**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Start the Development Server**
```bash
npm run dev
```
The frontend application will start locally at **`http://localhost:5173`**.

---

## **⚠️ CRITICAL: Switching Between Cloud & Local Backend**

By default, this repository is configured to connect to our live production cloud backend hosted on **Hugging Face Spaces** (`https://thirilojan-smartfit-ai-backend.hf.space`).

If you clone this repository to run the entire full-stack application **locally on your PC**, you must switch the API endpoints in the frontend code back to your local Python server (`http://127.0.0.1:5000`):

1. Open the following **3 files** in your code editor:
   * **`src/pages/Playground.jsx`**: Change `const API_BASE_URL = 'https://thirilojan-smartfit-ai-backend.hf.space';` to `'http://127.0.0.1:5000'` at the top of the file.
   * **`src/pages/UploadVideo.jsx`**: Change `const API_BASE_URL = 'https://thirilojan-smartfit-ai-backend.hf.space';` to `'http://127.0.0.1:5000'` at the top of the file.
   * **`src/components/Navbar.jsx`**: Directly replace `https://thirilojan-smartfit-ai-backend.hf.space/get-score` with `'http://127.0.0.1:5000/get-score'` inside the health check fetch (around line 10).
2. Start your local Python backend (`python main.py` in the `backend/` folder) and run `npm run dev`!

---

## **🌐 Cloud Deployment (Vercel)**
This frontend is optimized for zero-config deployment on **Vercel**.
To connect your production deployment to your cloud backend (e.g., Hugging Face Spaces):
1. In your Vercel Project Settings, navigate to **Environment Variables**.
2. Add a new variable:
   * **Key:** `VITE_API_URL`
   * **Value:** `https://thirilojan-smartfit-ai-backend.hf.space`
3. Redeploy your application to activate automatic cloud API routing!
