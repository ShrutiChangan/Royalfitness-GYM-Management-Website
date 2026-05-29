import sys
import joblib
import numpy as np

# Load model
model_path = sys.argv[1]
model = joblib.load(model_path)

# Get all numeric inputs
raw_inputs = [float(x) for x in sys.argv[2:]]

# Each food has 9 features
FEATURES_PER_FOOD = 9

# Convert into multiple rows
inputs = np.array(raw_inputs).reshape(-1, FEATURES_PER_FOOD)

# Predict for all foods
predictions = model.predict_proba(inputs)[:, 1]

# Print space-separated scores
print(" ".join([str(p) for p in predictions]))