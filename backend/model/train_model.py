import os
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import ModelCheckpoint

# Paths (adjusted to file structure)
SEQUENCE_DIR = "./dataset/sequences"
MODEL_DIR = "./model"
MODEL_SAVE_PATH = os.path.join(MODEL_DIR, "exercise_classifier.h5")
LABELS_SAVE_PATH = os.path.join(MODEL_DIR, "label_classes.npy")

def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def load_data():
    X, y = [], []

    for file in os.listdir(SEQUENCE_DIR):
        if file.endswith(".npy"):
            label = file.split("_sequences.npy")[0]
            sequences = np.load(os.path.join(SEQUENCE_DIR, file))
            X.extend(sequences)
            y.extend([label] * len(sequences))

    return np.array(X), np.array(y)

def build_model(input_shape, num_classes):
    model = Sequential([
        Conv1D(64, kernel_size=3, activation='relu', input_shape=input_shape),
        BatchNormalization(),
        Dropout(0.3),

        LSTM(128, return_sequences=True),
        Dropout(0.3),
        LSTM(64),
        Dropout(0.3),

        Dense(64, activation='relu'),
        Dense(num_classes, activation='softmax')
    ])

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

def main():
    print("[INFO] Loading data...")
    X, y = load_data()
    print(f"[INFO] Loaded dataset: {X.shape}, Labels: {set(y)}")

    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    y_categorical = to_categorical(y_encoded)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_categorical, test_size=0.2, stratify=y_categorical, random_state=42
    )

    # Build model
    print("[INFO] Building model...")
    model = build_model(input_shape=(30, 132), num_classes=len(le.classes_))

    # Ensure model directory exists
    create_dir(MODEL_DIR)

    # Callbacks
    checkpoint = ModelCheckpoint(MODEL_SAVE_PATH, monitor='val_accuracy', save_best_only=True)

    # Train
    print("[INFO] Training model...")
    model.fit(X_train, y_train, epochs=50, batch_size=32, validation_data=(X_test, y_test), callbacks=[checkpoint])

    # Save label encoder classes
    np.save(LABELS_SAVE_PATH, le.classes_)
    print(f"[DONE] Model saved to {MODEL_SAVE_PATH}")
    print(f"[DONE] Labels saved to {LABELS_SAVE_PATH}")

if __name__ == "__main__":
    main()
