import cv2
import mediapipe as mp
import numpy as np

# Initialize Mediapipe Pose
mp_pose = mp.solutions.pose

# Pose Correction Function
def pose_correction(frame, exercise_type, results=None):
    if results is None:
        with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(rgb_frame)
            return pose_correction(frame, exercise_type, results)

    if results and results.pose_landmarks:
        if True:
            # Extract key landmarks
            landmarks = results.pose_landmarks.landmark
            shoulder_left = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
            shoulder_right = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            hip_left = landmarks[mp_pose.PoseLandmark.LEFT_HIP]
            hip_right = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]
            knee_left = landmarks[mp_pose.PoseLandmark.LEFT_KNEE]
            knee_right = landmarks[mp_pose.PoseLandmark.RIGHT_KNEE]
            elbow_left = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW]
            elbow_right = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW]
            wrist_left = landmarks[mp_pose.PoseLandmark.LEFT_WRIST]
            wrist_right = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST]
            ankle_left = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE]
            ankle_right = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE]
            nose = landmarks[mp_pose.PoseLandmark.NOSE]

            avg_wrist_y = (wrist_left.y + wrist_right.y) / 2
            avg_shoulder_y = (shoulder_left.y + shoulder_right.y) / 2
            avg_hip_y = (hip_left.y + hip_right.y) / 2
            avg_ankle_y = (ankle_left.y + ankle_right.y) / 2

            wrong_posture = False
            if exercise_type == "push-up":
                if avg_wrist_y < (avg_shoulder_y - 0.05) or abs(avg_wrist_y - avg_ankle_y) > 0.35 or (avg_hip_y - avg_shoulder_y) > 0.32:
                    wrong_posture = True
            elif exercise_type == "pull-up":
                if avg_wrist_y > avg_shoulder_y:
                    wrong_posture = True
            elif exercise_type in ["squat", "lunges", "bicep-curl", "deadlift"]:
                if avg_wrist_y < nose.y or (avg_hip_y - avg_shoulder_y) < 0.15:
                    wrong_posture = True

            if wrong_posture:
                cv2.putText(frame, "WARNING: Wrong Exercise Pose!", (10, 240), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2, cv2.LINE_AA)

            # Common corrections
            shoulder_slope = abs(shoulder_left.y - shoulder_right.y)
            hip_slope = abs(hip_left.y - hip_right.y)

            if shoulder_slope > 0.03:
                cv2.putText(frame, "Straighten Your Shoulders", (10, 280), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2, cv2.LINE_AA)

            if hip_slope > 0.03:
                cv2.putText(frame, "Align Your Hips", (10, 310), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2, cv2.LINE_AA)

            # Exercise-specific corrections
            if exercise_type == "sit-up":
                if hip_left.y > knee_left.y:
                    cv2.putText(frame, "Lower Your Upper Body", (10, 340), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2, cv2.LINE_AA)
                if shoulder_left.y < hip_left.y:
                    cv2.putText(frame, "Curl Your Upper Body", (10, 370),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 100, 0), 2, cv2.LINE_AA)
                if abs(hip_left.x - hip_right.x) > 0.03:
                    cv2.putText(frame, "Engage Your Core", (10, 400),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (100, 255, 0), 2, cv2.LINE_AA)

            elif exercise_type == "pull-up":
                if shoulder_left.y < hip_left.y:
                    cv2.putText(frame, "Pull Higher", (10, 370), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2, cv2.LINE_AA)
                if abs(hip_left.y - shoulder_left.y) > 0.15:
                    cv2.putText(frame, "Engage Your Core", (10, 400), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 140, 0), 2, cv2.LINE_AA)
                if abs(elbow_left.x - elbow_right.x) > 0.2:
                    cv2.putText(frame, "Keep Your Elbows Close", (10, 430), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 100, 100), 2, cv2.LINE_AA)
                if shoulder_left.y - hip_left.y < 0.2:
                    cv2.putText(frame, "Control Your Descent", (10, 460), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 200), 2, cv2.LINE_AA)

            elif exercise_type == "push-up":
                if shoulder_left.y > hip_left.y:
                    cv2.putText(frame, "Keep Your Body Straight", (10, 400), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2, cv2.LINE_AA)
                if abs(elbow_left.y - shoulder_left.y) > 0.15:
                    cv2.putText(frame, "Align Elbows at 45 Degrees", (10, 430), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 140, 0), 2, cv2.LINE_AA)
                if abs(shoulder_left.y - hip_left.y) > 0.1:
                    cv2.putText(frame, "Engage Core - Avoid Sagging Hips", (10, 460), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 100, 100), 2, cv2.LINE_AA)
                if abs(shoulder_left.y - elbow_left.y) < 0.05:
                    cv2.putText(frame, "Lower Chest to Elbow Level", (10, 490), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (100, 200, 150), 2, cv2.LINE_AA)

            elif exercise_type == "squat":
                if hip_left.y < knee_left.y:
                    cv2.putText(frame, "Lower Your Hips", (10, 460),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 255), 2, cv2.LINE_AA)
                if knee_left.y > hip_left.y * 1.2:
                    cv2.putText(frame, "Don't Go Too Low", (10, 490),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 255), 2, cv2.LINE_AA)
                if abs(hip_left.x - knee_left.x) > 0.15:
                    cv2.putText(frame, "Align Your Knees and Hips", (10, 520),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 255), 2, cv2.LINE_AA)

            elif exercise_type == "plank":
                if abs(shoulder_left.y - hip_left.y) > 0.05:
                    cv2.putText(frame, "Keep Your Body Straight", (10, 340), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2, cv2.LINE_AA)

            elif exercise_type == "lunges":
                if knee_left.y < hip_left.y * 0.8:
                    cv2.putText(frame, "Lower Your Hips", (10, 340), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2, cv2.LINE_AA)

            elif exercise_type == "deadlift":
                if abs(shoulder_left.y - hip_left.y) > 0.1:
                    cv2.putText(frame, "Keep Your Back Straight", (10, 340), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 100, 100), 2, cv2.LINE_AA)

            elif exercise_type == "bicep-curl":
                if abs(elbow_left.y - shoulder_left.y) < 0.1:
                    cv2.putText(frame, "Lower Your Arm Fully", (10, 340), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 200), 2, cv2.LINE_AA)

            elif exercise_type == "dumbbell-shoulder-press":
                if elbow_left.y > shoulder_left.y:
                    cv2.putText(frame, "Raise Your Arms Higher", (10, 340), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 140, 0), 2, cv2.LINE_AA)

            elif exercise_type == "crunches":
                if shoulder_left.y > hip_left.y:
                    cv2.putText(frame, "Curl Upper Body Up", (10, 340), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 100, 0), 2, cv2.LINE_AA)

            elif exercise_type == "russian-twists":
                if abs(shoulder_left.x - hip_left.x) > 0.2:
                    cv2.putText(frame, "Rotate Your Torso", (10, 340), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (100, 255, 0), 2, cv2.LINE_AA)

            elif exercise_type == "jumping-jacks":
                if shoulder_left.y > hip_left.y:
                    cv2.putText(frame, "Raise Arms Above Head", (10, 340), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2, cv2.LINE_AA)
    
    return frame