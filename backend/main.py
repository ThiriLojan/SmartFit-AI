from flask import Flask, request, jsonify, Response
import cv2
import os
from utils import *
from body_part_angle import BodyPartAngle
from types_of_exercise import TypeOfExercise
from pose_correction import pose_correction
import mediapipe as mp
from flask_cors import CORS
import numpy as np
import base64

try:
    from tensorflow.keras.models import load_model
    ai_sequence_model = load_model("model/exercise_classifier.h5")
    ai_class_names = np.load("model/label_classes.npy")
    print("[INFO] Pre-trained AI Exercise Classifier loaded successfully!")
except Exception as e:
    ai_sequence_model = None
    ai_class_names = []
    print("[WARNING] Could not load AI model:", e)

def classify_sequence(pose_sequence):
    if ai_sequence_model is None or len(pose_sequence) < 30:
        return None, 0.0
    try:
        input_tensor = np.expand_dims(pose_sequence[-30:], axis=0)
        probs = ai_sequence_model(input_tensor, training=False).numpy()[0]
        best_idx = np.argmax(probs)
        return str(ai_class_names[best_idx]), float(probs[best_idx])
    except Exception:
        return None, 0.0

app = Flask(__name__)
CORS(app)

# ================================
# Health Check / Root Endpoint
# ================================
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online",
        "message": "SmartFit AI Edge Computer Vision & Deep Learning API Server is Running!",
        "version": "1.0.0"
    })

# MediaPipe Setup
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

# Active Stream Token to kill zombie background generator threads
active_stream_token = [0]

# ================================
# Video Upload Endpoint
# ================================
@app.route('/upload-video', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({"error": "No video file uploaded."}), 400

    video = request.files['video']
    exercise_type = request.form.get('exercise_type', 'push-up')

    video_path = os.path.join("temp_videos", video.filename)
    video.save(video_path)

    # Kill previous threads & Reset score counter
    active_stream_token[0] += 1
    score_data["counter"] = 0
    score_data["exercise"] = exercise_type
    score_data["status"] = "Analyzing..."

    return jsonify({"message": "Video uploaded successfully.", "filename": video.filename})


@app.route('/stream-uploaded')
def stream_uploaded():
    filename = request.args.get('filename')
    exercise_type = request.args.get('exercise_type', 'push-up')
    if not filename:
        return "Filename required", 400

    video_path = os.path.join("temp_videos", filename)
    if not os.path.exists(video_path):
        return "File not found", 404

    # Reset global score counter before streaming frames
    active_stream_token[0] += 1
    my_token = active_stream_token[0]
    score_data["counter"] = 0
    score_data["exercise"] = exercise_type
    score_data["status"] = "Analyzing..."
    score_data["progress"] = 0.0
    score_data["ai_detected"] = "Scanning movement..."

    def generate():
        cap = cv2.VideoCapture(video_path)
        counter, status = 0, True
        pose_sequence = []

        with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5, model_complexity=0) as pose:
            while cap.isOpened():
                if active_stream_token[0] != my_token:
                    break
                ret, frame = cap.read()
                if not ret:
                    break

                # Resize for smooth streaming performance
                frame = cv2.resize(frame, (640, 360))
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = pose.process(frame_rgb)

                active_ex = exercise_type
                if results.pose_landmarks:
                    try:
                        landmarks = results.pose_landmarks.landmark
                        vec = np.array([[lm.x, lm.y, lm.z, lm.visibility] for lm in landmarks]).flatten()
                        pose_sequence.append(vec)
                        if len(pose_sequence) > 30:
                            pose_sequence.pop(0)

                        detected_ex, conf = classify_sequence(pose_sequence)
                        if detected_ex and conf > 0.6:
                            score_data["ai_detected"] = f"{detected_ex.replace('-', ' ').title()} ({int(conf * 100)}%)"
                            if exercise_type in ['auto', 'free-pose']:
                                active_ex = detected_ex
                        else:
                            if exercise_type in ['auto', 'free-pose']:
                                score_data["ai_detected"] = "Scanning pose sequence..."
                                active_ex = active_ex if active_ex != 'free-pose' else 'push-up'

                        if exercise_type == 'free-pose':
                            current_cnt = score_data.setdefault("free_pose_counts", {}).get(active_ex, 0)
                            new_cnt, status = TypeOfExercise(landmarks).calculate_exercise(active_ex, current_cnt, status)
                            score_data["free_pose_counts"][active_ex] = new_cnt
                            counter = sum(score_data["free_pose_counts"].values())
                        else:
                            counter, status = TypeOfExercise(landmarks).calculate_exercise(active_ex, counter, status)
                    except AttributeError:
                        pass

                    mp_drawing.draw_landmarks(
                        frame,
                        results.pose_landmarks,
                        mp_pose.POSE_CONNECTIONS,
                        mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2, circle_radius=2),
                        mp_drawing.DrawingSpec(color=(255, 92, 0), thickness=2, circle_radius=2),
                    )

                # Update score_data for polling
                score_data["counter"] = counter
                if results.pose_landmarks:
                    score_data["status"] = "Correct Form" if status else "Incorrect Form"
                else:
                    score_data["status"] = "No Pose Detected"
                    score_data["ai_detected"] = "No Person in Frame"
                score_data["progress"] = min(counter / 12, 1.0)
                score_data["exercise"] = active_ex

                frame = pose_correction(frame, active_ex, results)

                _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
                frame_bytes = buffer.tobytes()

                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

        cap.release()

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')



# ================================
# Live Webcam Endpoint
# ================================
@app.route('/start-webcam')
def start_webcam():
    exercise_type = request.args.get('exercise_type', 'push-up')
    flip_camera = request.args.get('flip', 'false').lower() == 'true'
    cap = cv2.VideoCapture(0)
    
    # Reset global counter before starting webcam stream
    active_stream_token[0] += 1
    my_token = active_stream_token[0]
    score_data["counter"] = 0
    score_data["exercise"] = exercise_type
    score_data["status"] = "Good Form"
    score_data["progress"] = 0.0
    score_data["ai_detected"] = "Scanning movement..."

    def generate():
        with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5, model_complexity=0) as pose:
            counter = 0
            status = True
            pose_sequence = []
            while True:
                if active_stream_token[0] != my_token:
                    break
                ret, frame = cap.read()
                if not ret:
                    break
                    
                if flip_camera:
                    frame = cv2.flip(frame, 1)

                frame = cv2.resize(frame, (640, 360))
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = pose.process(frame)
                frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

                active_ex = exercise_type
                try:
                    landmarks = results.pose_landmarks.landmark
                    vec = np.array([[lm.x, lm.y, lm.z, lm.visibility] for lm in landmarks]).flatten()
                    pose_sequence.append(vec)
                    if len(pose_sequence) > 30:
                        pose_sequence.pop(0)

                    detected_ex, conf = classify_sequence(pose_sequence)
                    if detected_ex and conf > 0.6:
                        score_data["ai_detected"] = f"{detected_ex.replace('-', ' ').title()} ({int(conf * 100)}%)"
                        if exercise_type in ['auto', 'free-pose']:
                            active_ex = detected_ex
                    else:
                        if exercise_type in ['auto', 'free-pose']:
                            score_data["ai_detected"] = "Scanning pose sequence..."
                            active_ex = active_ex if active_ex != 'free-pose' else 'push-up'

                    if exercise_type == 'free-pose':
                        current_cnt = score_data.setdefault("free_pose_counts", {}).get(active_ex, 0)
                        new_cnt, status = TypeOfExercise(landmarks).calculate_exercise(active_ex, current_cnt, status)
                        score_data["free_pose_counts"][active_ex] = new_cnt
                        counter = sum(score_data["free_pose_counts"].values())
                    else:
                        counter, status = TypeOfExercise(landmarks).calculate_exercise(active_ex, counter, status)
                except AttributeError:
                    pass

                # Update score_data for frontend API
                score_data["counter"] = counter
                if results.pose_landmarks:
                    score_data["status"] = "Correct Form" if status else "Incorrect Form"
                else:
                    score_data["status"] = "No Pose Detected"
                    score_data["ai_detected"] = "No Person in Frame"
                score_data["progress"] = min(counter / 12, 1.0)
                score_data["exercise"] = active_ex


                frame = pose_correction(frame, active_ex, results)

                mp_drawing.draw_landmarks(
                    frame,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2, circle_radius=2),
                    mp_drawing.DrawingSpec(color=(174, 139, 45), thickness=2, circle_radius=2),
                )

                _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
                frame_data = buffer.tobytes()

                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n')

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Sample Score Data
score_data = {
    "exercise": "push-up",
    "counter": 0,
    "status": "Good Form",
    "progress": 0.0,
    "ai_detected": "Ready",
    "free_pose_counts": {}
}

# Global state for browser webcam frame processing
browser_pose_sequence = []
browser_counter = 0
browser_status = True
global_pose_tracker = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5, model_complexity=0)

@app.route('/process-frame', methods=['POST'])
def process_frame():
    global browser_counter, browser_status, browser_pose_sequence
    try:
        data = request.json.get('image', '')
        exercise_type = request.json.get('exercise_type', 'push-up')
        if not data:
            return jsonify({"error": "No image data"}), 400
            
        header, encoded = data.split(',', 1)
        image_bytes = base64.b64decode(encoded)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({"error": "Invalid frame"}), 400

        frame = cv2.resize(frame, (640, 360))
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        results = global_pose_tracker.process(frame_rgb)
        
        active_ex = exercise_type
        if results.pose_landmarks:
            try:
                landmarks = results.pose_landmarks.landmark
                vec = np.array([[lm.x, lm.y, lm.z, lm.visibility] for lm in landmarks]).flatten()
                browser_pose_sequence.append(vec)
                if len(browser_pose_sequence) > 30:
                    browser_pose_sequence.pop(0)

                detected_ex, conf = classify_sequence(browser_pose_sequence)
                if detected_ex and conf > 0.6:
                    score_data["ai_detected"] = f"{detected_ex.replace('-', ' ').title()} ({int(conf * 100)}%)"
                    if exercise_type in ['auto', 'free-pose']:
                        active_ex = detected_ex
                else:
                    if exercise_type in ['auto', 'free-pose']:
                        score_data["ai_detected"] = "Scanning pose sequence..."
                        active_ex = active_ex if active_ex != 'free-pose' else 'push-up'

                if exercise_type == 'free-pose':
                    current_cnt = score_data.setdefault("free_pose_counts", {}).get(active_ex, 0)
                    new_cnt, browser_status = TypeOfExercise(landmarks).calculate_exercise(active_ex, current_cnt, browser_status)
                    score_data["free_pose_counts"][active_ex] = new_cnt
                    browser_counter = sum(score_data["free_pose_counts"].values())
                else:
                    browser_counter, browser_status = TypeOfExercise(landmarks).calculate_exercise(
                        active_ex, browser_counter, browser_status)
            except AttributeError:
                pass

            score_data["counter"] = browser_counter
            score_data["status"] = "Correct Form" if browser_status else "Incorrect Form"
            score_data["progress"] = min(browser_counter / 12, 1.0)
            score_data["exercise"] = active_ex

            frame = pose_correction(frame, active_ex, results)

            mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2, circle_radius=2),
                mp_drawing.DrawingSpec(color=(174, 139, 45), thickness=2, circle_radius=2),
            )
        else:
            score_data["status"] = "No Pose Detected"
            score_data["ai_detected"] = "No Person in Frame"
                
        _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 65])
        encoded_image = 'data:image/jpeg;base64,' + base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            "annotated_image": encoded_image,
            "counter": score_data["counter"],
            "status": score_data["status"],
            "ai_detected": score_data["ai_detected"],
            "free_pose_counts": score_data.get("free_pose_counts", {})
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================================
# Score Table & Reset API
# ================================
@app.route('/get-score', methods=['GET'])
def get_score():
    return jsonify(score_data)


@app.route('/reset-score', methods=['POST'])
def reset_score():
    global browser_counter, browser_status, browser_pose_sequence
    from types_of_exercise import reset_rep_timer
    reset_rep_timer()
    active_stream_token[0] += 1
    score_data["counter"] = 0
    score_data["status"] = "Good Form"
    score_data["progress"] = 0.0
    score_data["ai_detected"] = "Ready"
    score_data["free_pose_counts"] = {}
    browser_counter = 0
    browser_status = True
    browser_pose_sequence = []
    return jsonify({"message": "Score reset successfully"})

if __name__ == "__main__":
    if not os.path.exists("temp_videos"):
        os.makedirs("temp_videos")
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)