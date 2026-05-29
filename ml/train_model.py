import pandas as pd
import numpy as np
import joblib
import random
from xgboost import XGBClassifier

# 🔹 Load CSV
df = pd.read_csv("server/indian_food.csv")

# 🔥 Rename columns EXACTLY based on your CSV
df = df.rename(columns={
    "Dish Name": "name",
    "Calories (kcal)": "calories",
    "Carbohydrates (g)": "carbs",
    "Protein (g)": "protein",
    "Fats (g)": "fat"
})

# 🔹 Keep only required columns
df = df[["name", "calories", "carbs", "protein", "fat"]]

# 🔥 ADD IT HERE
print(df.head())


# 🔹 Convert to numeric (VERY IMPORTANT)
for col in ["calories", "carbs", "protein", "fat"]:
    df[col] = pd.to_numeric(df[col], errors="coerce")

# 🔹 Drop invalid rows
df = df.dropna()

training_data = []

# 🔥 Generate training data
for _, food in df.iterrows():
    for _ in range(10):  # ~1000 rows → ~10k samples
        
        target_calories = random.randint(1500, 3000)
        target_protein = random.randint(50, 150)
        target_carbs = random.randint(150, 400)
        target_fat = random.randint(30, 100)

        goal = random.choice([0, 1])  # 0 = lose, 1 = gain

        diff = (
            abs(target_calories - food["calories"]) +
            abs(target_protein - food["protein"]) +
            abs(target_carbs - food["carbs"]) +
            abs(target_fat - food["fat"])
        )

        label = 1 if diff < 400 else 0

        training_data.append([
            target_calories,
            target_protein,
            target_carbs,
            target_fat,
            food["calories"],
            food["protein"],
            food["carbs"],
            food["fat"],
            goal,
            label
        ])

# 🔹 Create DataFrame
columns = [
    "t_cal", "t_pro", "t_carb", "t_fat",
    "f_cal", "f_pro", "f_carb", "f_fat",
    "goal", "label"
]

train_df = pd.DataFrame(training_data, columns=columns)

X = train_df.drop("label", axis=1)
y = train_df["label"]

# 🔹 Train model
model = XGBClassifier(
    n_estimators=150,
    max_depth=6,
    learning_rate=0.1,
    use_label_encoder=False,
    eval_metric="logloss"
)

model.fit(X, y)

# 🔹 Save model
joblib.dump(model, "ml/diet_model.pkl")

print("✅ Model trained using indian_food.csv and saved")