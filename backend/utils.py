
import mediapipe as mp
import pandas as pd
import numpy as np
import cv2

mp_pose = mp.solutions.pose

def calculate_angle(a, b, c):
    a = np.array(a)  
    b = np.array(b)  
    c = np.array(c)  

    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) -\
              np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle

    return angle



def detection_body_part(landmarks, body_part_name):
    return [
        landmarks[mp_pose.PoseLandmark[body_part_name].value].x,
        landmarks[mp_pose.PoseLandmark[body_part_name].value].y,
        landmarks[mp_pose.PoseLandmark[body_part_name].value].visibility
    ]


def detection_body_parts(landmarks):
    body_parts = pd.DataFrame(columns=["body_part", "x", "y"])

    for i, lndmrk in enumerate(mp_pose.PoseLandmark):
        lndmrk = str(lndmrk).split(".")[1]
        cord = detection_body_part(landmarks, lndmrk)
        body_parts.loc[i] = lndmrk, cord[0], cord[1]

    return body_parts


def score_table(exercise, frame, counter, status):
    overlay = frame.copy()
    
    # Increase the overlay height to leave space for the progress bar
    cv2.rectangle(overlay, (0, 0), (250, 180), (0, 0, 0), -1)  
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)

    # Title
    cv2.putText(frame, "EXERCISE TRACKER", (10, 30), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2, cv2.LINE_AA)

    # Exercise Type
    cv2.putText(frame, f"Activity : {exercise.replace('-', ' ')}",
                (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)

    # Counter Display
    cv2.putText(frame, f"Counter : {counter}", 
                (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2, cv2.LINE_AA)

    # Status Indicator (Green for correct, Red for incorrect)
    status_color = (0, 255, 0) if status else (0, 0, 255)
    cv2.putText(frame, f"Status : {'Correct' if status else 'Incorrect'}", 
                (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2, cv2.LINE_AA)

    return frame


def draw_progress_bar(frame, progress):
    bar_width = 200
    bar_height = 20
    filled_width = int(bar_width * progress)

    # Dynamic color logic
    if progress >= 0.9:
        color = (0, 0, 255)  # Red for 90%+
    elif progress >= 0.5:
        color = (0, 165, 255)  # Orange for 50%+
    else:
        color = (0, 255, 0)  # Green for below 50%

    # Increased Y position for spacing
    progress_bar_y = 190  

    # Background Bar (Grey)
    cv2.rectangle(frame, (10, progress_bar_y), 
                  (10 + bar_width, progress_bar_y + bar_height), (50, 50, 50), -1)

    # Filled Progress Bar (Dynamic Color)
    cv2.rectangle(frame, (10, progress_bar_y), 
                  (10 + filled_width, progress_bar_y + bar_height), color, -1)

    # Progress Text
    cv2.putText(frame, f"{int(progress * 100)}%", 
                (10 + bar_width + 10, progress_bar_y + 15),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
