import cv2
import os

# Paths
VIDEOS_DIR = "./Exercise_videos"  # This directory now contains subdirectories for each exercise
OUTPUT_DIR = "./dataset/raw_frames"
FRAME_INTERVAL = 5  # Save every 5th frame to reduce redundancy

def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def extract_frames_from_videos():
    create_dir(OUTPUT_DIR)

    # Loop through each exercise folder
    for exercise_folder in os.listdir(VIDEOS_DIR):
        exercise_folder_path = os.path.join(VIDEOS_DIR, exercise_folder)
        
        # Check if it's a directory and has videos
        if os.path.isdir(exercise_folder_path):
            exercise_dir = os.path.join(OUTPUT_DIR, exercise_folder.lower())  # Exercise folder in output directory
            create_dir(exercise_dir)

            # Process each video in the exercise folder
            for filename in os.listdir(exercise_folder_path):
                if filename.endswith(".mp4"):
                    video_path = os.path.join(exercise_folder_path, filename)
                    video_name = os.path.splitext(filename)[0].lower().replace(" ", "-")
                    frame_idx = 0
                    saved_frame_count = 0

                    cap = cv2.VideoCapture(video_path)

                    print(f"[INFO] Extracting frames from {filename}...")

                    while cap.isOpened():
                        ret, frame = cap.read()
                        if not ret:
                            break

                        if frame_idx % FRAME_INTERVAL == 0:
                            # Save frame with a unique name
                            frame_name = f"{video_name}_{saved_frame_count:04d}.jpg"
                            frame_path = os.path.join(exercise_dir, frame_name)
                            cv2.imwrite(frame_path, frame)
                            saved_frame_count += 1

                        frame_idx += 1

                    cap.release()
                    print(f"[DONE] Saved {saved_frame_count} frames from {filename} to {exercise_dir}")

if __name__ == "__main__":
    extract_frames_from_videos()
