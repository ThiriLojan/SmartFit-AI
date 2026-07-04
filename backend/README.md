# 🤖 SmartFit AI — Computer Vision & Deep Learning Backend

This directory contains the Python edge AI server for **SmartFit AI**. It combines **MediaPipe Pose** for real-time 3D skeleton tracking with a custom **1D-CNN + LSTM Deep Learning Neural Network** for time-series exercise classification and repetition form analysis.

---

## **🧠 AI & Engineering Architecture**
* **Core API Framework:** Python 3.10 + Flask + Flask-CORS (REST API & Real-time Video Streaming)
* **Computer Vision Pipeline:** OpenCV (`cv2`) + MediaPipe Pose (33 3D body landmark coordinate extraction)
* **Deep Learning Engine:** Keras / TensorFlow (1D-Convolutional Neural Network + Long Short-Term Memory network for temporal sequence recognition)
* **Biomechanical Trigonometry:** Vector dot-product angle calculations for joint flexion/extension evaluation (elbows, knees, hips, shoulders)
* **Containerization:** Docker (Debian Bookworm/Trixie optimized with C++ OpenCV system dependencies `libgl1`, `libglib2.0-0`)

---

## **🗂️ Directory Structure**
* **`model/`:** Contains the compiled Keras deep learning model weights (`exercise_classifier.h5`), class label encodings (`label_classes.npy`), and model training scripts.
* **`dataset/`:** Contains the extracted 3D skeleton keypoints (`pose_landmarks/`) and temporal training arrays (`sequences/`).
* **`dataset/exercise_videos/`:** Contains benchmark workout demonstration videos (`.mp4`) across 7 primary exercise categories.
* **`main.py`:** The master Flask server handling multipart video uploads, real-time webcam frame processing, and score state management.

---

## **🔌 API Endpoints**
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/` | Health check endpoint returning JSON online status and server version |
| **GET** | `/get-score` | Returns real-time repetition counts, posture status (*Good Form* / *Adjust Form*), and progress percentage |
| **POST** | `/reset-score` | Resets active exercise counters, timers, and sequence state machines |
| **POST** | `/upload-video` | Accepts multipart `.mp4` video uploads for asynchronous frame-by-frame biomechanical evaluation |
| **GET** | `/video_feed` | Multipart JPEG streaming endpoint rendering real-time pose skeleton overlays |

---

## **🚀 Running Locally**

### **1. Create & Activate Virtual Environment**
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### **2. Install Dependencies**
```bash
pip install -r requirements.txt
```

### **3. Start the AI API Server**
```bash
python main.py
```
The server will listen on **`http://127.0.0.1:5000`** (or the custom port defined in your `PORT` environment variable).

> [!IMPORTANT]
> **Connecting to Local Frontend:**  
> By default, our GitHub frontend code is wired to connect to our live cloud backend on **Hugging Face Spaces**. If you are running both frontend and backend locally on your computer, remember to update `const API_BASE_URL` in `Playground.jsx` and `UploadVideo.jsx`, and the direct fetch URL in `Navbar.jsx`, from `https://thirilojan-smartfit-ai-backend.hf.space` back to **`http://127.0.0.1:5000`**!

---

## **☁️ Cloud Deployment (Hugging Face Spaces)**
This backend is fully containerized with a custom `Dockerfile` designed for **Hugging Face Spaces (Docker SDK)**. It automatically configures Linux system libraries (`libgl1`, `libsm6`, `libxext6`) and listens on port `7860`.
