import numpy as np
import time
from body_part_angle import BodyPartAngle
from utils import *

_last_rep_time = {"timestamp": 0}
_plank_timer = {"start_time": 0.0, "is_planking": False}

def can_count_rep():
    current_time = time.time()
    if current_time - _last_rep_time["timestamp"] > 0.9:
        _last_rep_time["timestamp"] = current_time
        return True
    return False

def reset_rep_timer():
    _last_rep_time["timestamp"] = 0
    _plank_timer["start_time"] = 0.0
    _plank_timer["is_planking"] = False

class TypeOfExercise(BodyPartAngle):
    def __init__(self, landmarks):
        super().__init__(landmarks)

    def push_up(self, counter, status):
        left_arm_angle = self.angle_of_the_left_arm()
        right_arm_angle = self.angle_of_the_right_arm()
        avg_arm_angle = (left_arm_angle + right_arm_angle) // 2

        if status:
            if avg_arm_angle < 70:
                if can_count_rep():
                    counter += 1
                    status = False
        else:
            if avg_arm_angle > 160 and (time.time() - _last_rep_time["timestamp"] > 0.5):
                status = True

        return [counter, status]

    def pull_up(self, counter, status):
        nose = detection_body_part(self.landmarks, "NOSE")
        left_elbow = detection_body_part(self.landmarks, "LEFT_ELBOW")
        right_elbow = detection_body_part(self.landmarks, "RIGHT_ELBOW")
        avg_shoulder_y = (left_elbow[1] + right_elbow[1]) / 2

        if status:
            if nose[1] > avg_shoulder_y:
                if can_count_rep():
                    counter += 1
                    status = False
        else:
            if nose[1] < avg_shoulder_y and (time.time() - _last_rep_time["timestamp"] > 0.5):
                status = True

        return [counter, status]

    def squat(self, counter, status):
        left_leg_angle = self.angle_of_the_right_leg()
        right_leg_angle = self.angle_of_the_left_leg()
        avg_leg_angle = (left_leg_angle + right_leg_angle) // 2

        if status:
            if avg_leg_angle < 70:
                if can_count_rep():
                    counter += 1
                    status = False
        else:
            if avg_leg_angle > 160 and (time.time() - _last_rep_time["timestamp"] > 0.5):
                status = True

        return [counter, status]

    def plank(self, counter, status):
        plank_angle = self.angle_of_the_plank()

        # Wide angle range (135° to 180°) so normal plank posture is reliably held
        if 135 <= plank_angle <= 180:
            if not _plank_timer["is_planking"]:
                # If resuming after brief pause, start time is adjusted by current counter seconds
                _plank_timer["start_time"] = time.time() - counter
                _plank_timer["is_planking"] = True
            
            elapsed_time = int(time.time() - _plank_timer["start_time"])
            status = True
            return [elapsed_time, status]
        else:
            _plank_timer["is_planking"] = False
            status = False
            return [counter, status]

    def lunges(self, counter, status):
        knee_angle = self.angle_of_the_left_leg()
        if status:
            if knee_angle < 70:
                if can_count_rep():
                    counter += 1
                    status = False
        else:
            if knee_angle > 160 and (time.time() - _last_rep_time["timestamp"] > 0.5):
                status = True

        return [counter, status]

    def deadlift(self, counter, status):
        back_angle = self.angle_of_the_spine()
        if status:
            if back_angle < 60:
                if can_count_rep():
                    counter += 1
                    status = False
        else:
            if back_angle > 150 and (time.time() - _last_rep_time["timestamp"] > 0.5):
                status = True

        return [counter, status]

    def bicep_curl(self, counter, status):
        elbow_angle = self.angle_of_the_left_arm()
        if status:
            if elbow_angle < 40:
                if can_count_rep():
                    counter += 1
                    status = False
        else:
            if elbow_angle > 150 and (time.time() - _last_rep_time["timestamp"] > 0.5):
                status = True

        return [counter, status]

    def dumbbell_shoulder_press(self, counter, status):
        arm_angle = self.angle_of_the_left_arm()
        if status:
            if arm_angle > 160:
                if can_count_rep():
                    counter += 1
                    status = False
        else:
            if arm_angle < 90 and (time.time() - _last_rep_time["timestamp"] > 0.5):
                status = True

        return [counter, status]

    def crunches(self, counter, status):
        abdomen_angle = self.angle_of_the_abdomen()
        if status:
            if abdomen_angle < 45:
                if can_count_rep():
                    counter += 1
                    status = False
        else:
            if abdomen_angle > 100 and (time.time() - _last_rep_time["timestamp"] > 0.5):
                status = True

        return [counter, status]

    def russian_twists(self, counter, status):
        torso_angle = self.angle_of_the_torso()
        if status:
            if torso_angle < 45 or torso_angle > 135:
                if can_count_rep():
                    counter += 1
                    status = False
        else:
            if 80 < torso_angle < 100 and (time.time() - _last_rep_time["timestamp"] > 0.5):
                status = True

        return [counter, status]

    def jumping_jacks(self, counter, status):
        hand_position = detection_body_part(self.landmarks, "LEFT_WRIST")
        if status:
            if hand_position[1] < detection_body_part(self.landmarks, "LEFT_SHOULDER")[1]:
                if can_count_rep():
                    counter += 1
                    status = False
        else:
            if hand_position[1] > detection_body_part(self.landmarks, "LEFT_HIP")[1] and (time.time() - _last_rep_time["timestamp"] > 0.5):
                status = True

        return [counter, status]

    def sit_up(self, counter, status):
        angle = self.angle_of_the_abdomen()
        if status:
            if angle < 55:
                if can_count_rep():
                    counter += 1
                    status = False
        else:
            if angle > 105 and (time.time() - _last_rep_time["timestamp"] > 0.5):
                status = True

        return [counter, status]

    def is_valid_posture(self, exercise_type):
        try:
            nose = detection_body_part(self.landmarks, "NOSE")
            l_wrist = detection_body_part(self.landmarks, "LEFT_WRIST")
            r_wrist = detection_body_part(self.landmarks, "RIGHT_WRIST")
            l_shoulder = detection_body_part(self.landmarks, "LEFT_SHOULDER")
            r_shoulder = detection_body_part(self.landmarks, "RIGHT_SHOULDER")
            l_hip = detection_body_part(self.landmarks, "LEFT_HIP")
            r_hip = detection_body_part(self.landmarks, "RIGHT_HIP")
            l_ankle = detection_body_part(self.landmarks, "LEFT_ANKLE")
            r_ankle = detection_body_part(self.landmarks, "RIGHT_ANKLE")

            avg_wrist_y = (l_wrist[1] + r_wrist[1]) / 2
            avg_shoulder_y = (l_shoulder[1] + r_shoulder[1]) / 2
            avg_hip_y = (l_hip[1] + r_hip[1]) / 2
            avg_ankle_y = (l_ankle[1] + r_ankle[1]) / 2

            if exercise_type == "push-up":
                # In a pushup, hands support from below shoulders (not reaching up above shoulders),
                # hands and feet are both on the floor (wrist and ankle Y are close),
                # and torso is not standing upright (hip Y is not far below shoulder Y).
                if avg_wrist_y < (avg_shoulder_y - 0.05) or abs(avg_wrist_y - avg_ankle_y) > 0.35 or (avg_hip_y - avg_shoulder_y) > 0.32:
                    return False
            elif exercise_type == "pull-up":
                if avg_wrist_y > avg_shoulder_y:
                    return False
            elif exercise_type in ["squat", "lunges", "bicep-curl", "deadlift"]:
                if avg_wrist_y < nose[1] or (avg_hip_y - avg_shoulder_y) < 0.15:
                    return False
        except Exception:
            pass
        return True

    def calculate_exercise(self, exercise_type, counter, status):
        if not self.is_valid_posture(exercise_type):
            return [counter, status]

        if exercise_type == "push-up":
            counter, status = TypeOfExercise(self.landmarks).push_up(
                counter, status)
        elif exercise_type == "pull-up":
            counter, status = TypeOfExercise(self.landmarks).pull_up(
                counter, status)
        elif exercise_type == "squat":
            counter, status = TypeOfExercise(self.landmarks).squat(
                counter, status)
        elif exercise_type == "plank":
            counter, status = TypeOfExercise(self.landmarks).plank(
                counter, status)
        elif exercise_type == "lunges":
            counter, status = TypeOfExercise(self.landmarks).lunges(
                counter, status)
        elif exercise_type == "deadlift":
            counter, status = TypeOfExercise(self.landmarks).deadlift(
                counter, status)
        elif exercise_type == "bicep-curl":
            counter, status = TypeOfExercise(self.landmarks).bicep_curl(
                counter, status)
        elif exercise_type == "dumbbell-shoulder-press":
            counter, status = TypeOfExercise(self.landmarks).dumbbell_shoulder_press(
                counter, status)
        elif exercise_type == "crunches":
            counter, status = TypeOfExercise(self.landmarks).crunches(
                counter, status)
        elif exercise_type == "russian-twist":
            counter, status = TypeOfExercise(self.landmarks).russian_twists(
                counter, status)
        elif exercise_type == "jumping-jacks":
            counter, status = TypeOfExercise(self.landmarks).jumping_jacks(
                counter, status)
        elif exercise_type == "sit-up":
            counter, status = TypeOfExercise(self.landmarks).sit_up(
                counter, status)

        return [counter, status]
