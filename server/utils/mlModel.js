const { spawnSync } = require("child_process");
const path = require("path");

function scoreMultipleFoods(foods, target, goal) {
  try {
    const modelPath = path.join(__dirname, "../../ml/diet_model.pkl");
    const scriptPath = path.join(__dirname, "../../ml/predict.py");

    const args = [scriptPath, modelPath];

    // Flatten features
    foods.forEach(food => {
      args.push(
        target.calories,
        target.protein,
        target.carbs,
        target.fat,
        food.calories,
        food.protein,
        food.carbs,
        food.fat,
        goal === "gain" ? 1 : 0
      );
    });

    console.log(`🚀 Running ML (spawnSync) for ${foods.length} foods`);

    const result = spawnSync("python", args, {
      encoding: "utf-8",
      timeout: 15000 // 15 sec
    });

    if (result.error) {
      console.error("❌ Spawn Error:", result.error);
      throw result.error;
    }

    if (!result.stdout) {
      console.error("❌ No output from Python");
      throw new Error("No ML output");
    }

    console.log("✅ ML RAW OUTPUT:", result.stdout);

    const scores = result.stdout.trim().split(" ").map(Number);

    const scoredFoods = foods.map((food, i) => ({
      ...food,
      mlScore: scores[i] || 0.1
    }));

    scoredFoods.sort((a, b) => b.mlScore - a.mlScore);

    return scoredFoods;

  } catch (err) {
    console.error("❌ ML FAILED COMPLETELY:", err);

    // fallback scores
    return foods.map(f => ({ ...f, mlScore: 0.1 }));
  }
}

module.exports = { scoreMultipleFoods };
