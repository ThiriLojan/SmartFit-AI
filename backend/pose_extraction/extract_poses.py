import os
import cv2
import mediapipe as mp
import numpy as np
import pandas as pd

# Paths
FRAMES_DIR = "./dataset/raw_frames"
OUTPUT_DIR = "./dataset/pose_landmarks"

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True)
mp_drawing = mp.solutions.drawing_utils

def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def extract_landmarks(image):
    results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    if not results.pose_landmarks:
        return None
    # Return flattened list: [x1, y1, z1, vis1, x2, y2, ...]
    return np.array([[lm.x, lm.y, lm.z, lm.visibility] for lm in results.pose_landmarks.landmark]).flatten()

def extract_all_landmarks():
    create_dir(OUTPUT_DIR)

    for exercise in os.listdir(FRAMES_DIR):
        exercise_path = os.path.join(FRAMES_DIR, exercise)
        if not os.path.isdir(exercise_path):
            continue

        save_dir = os.path.join(OUTPUT_DIR, exercise)
        create_dir(save_dir)

        data_rows = []

        for img_file in sorted(os.listdir(exercise_path)):
            if img_file.endswith(".jpg"):
                img_path = os.path.join(exercise_path, img_file)
                image = cv2.imread(img_path)

                landmarks = extract_landmarks(image)
                if landmarks is not None:
                    data_rows.append(landmarks)

        # Save as CSV
        df = pd.DataFrame(data_rows)
        csv_path = os.path.join(save_dir, f"{exercise}_landmarks.csv")
        df.to_csv(csv_path, index=False)
        print(f"[DONE] Saved {len(data_rows)} pose vectors to {csv_path}")

if __name__ == "__main__":
    extract_all_landmarks()
