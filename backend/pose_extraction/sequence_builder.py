import os
import pandas as pd
import numpy as np

# Paths
LANDMARKS_DIR = "./dataset/pose_landmarks"
SEQUENCE_DIR = "./dataset/sequences"

SEQUENCE_LENGTH = 30  # Number of frames per sequence

def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def build_sequences():
    create_dir(SEQUENCE_DIR)

    for exercise in os.listdir(LANDMARKS_DIR):
        exercise_path = os.path.join(LANDMARKS_DIR, exercise)
        if not os.path.isdir(exercise_path):
            continue

        csv_files = [f for f in os.listdir(exercise_path) if f.endswith(".csv")]

        for csv_file in csv_files:
            df = pd.read_csv(os.path.join(exercise_path, csv_file))

            if len(df) < SEQUENCE_LENGTH:
                print(f"[SKIP] {csv_file} has fewer than {SEQUENCE_LENGTH} frames.")
                continue

            # Build overlapping sequences
            sequences = []
            for i in range(len(df) - SEQUENCE_LENGTH + 1):
                sequence = df.iloc[i:i + SEQUENCE_LENGTH].values
                sequences.append(sequence)

            # Convert to numpy array
            sequences = np.array(sequences)

            # Save
            save_path = os.path.join(SEQUENCE_DIR, f"{exercise}_sequences.npy")
            np.save(save_path, sequences)

            print(f"[DONE] Saved {len(sequences)} sequences to {save_path}")

if __name__ == "__main__":
    build_sequences()
