// Calculate calories + macros with biologically accurate distributions

function calculateNutrition({ age, weight, height, gender, activityLevel, goal }) {
  let bmr;

  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMap = {
    sedentary: 1.2,
    moderate: 1.55,
    active: 1.725,
  };

  let calories = bmr * (activityMap[activityLevel] || 1.2);

  // Handle different goal formats
  const normalizedGoal = goal === "weight_loss" ? "lose" :
                        goal === "muscle_gain" ? "gain" :
                        goal === "maintenance" ? "maintain" : goal;

  if (normalizedGoal === "lose") calories -= 500;
  if (normalizedGoal === "gain") calories += 300;

  // Biologically accurate macro distribution based on goal
  let protein, fatPercent, carbPercent;

  switch (normalizedGoal) {
    case "gain":
      // Higher protein for muscle building: target 2.0g/kg (within 1.8-2.2)
      protein = Math.min(Math.max(weight * 2.0, weight * 1.8), weight * 2.2);
      fatPercent = 0.25; // 25% fat
      carbPercent = 0.55; // 55% carbs for energy surplus
      break;
    case "lose":
      // Moderate protein to preserve muscle: target 1.8g/kg (within 1.6-2.0)
      protein = Math.min(Math.max(weight * 1.8, weight * 1.6), weight * 2.0);
      fatPercent = 0.25; // 25% fat
      carbPercent = 0.55; // 55% carbs to maintain energy
      break;
    case "maintain":
    default:
      // Standard protein: target 1.4g/kg (within 1.2-1.6)
      protein = Math.min(Math.max(weight * 1.4, weight * 1.2), weight * 1.6);
      fatPercent = 0.30; // 30% fat for maintenance
      carbPercent = 0.50; // 50% carbs
      break;
  }

  // Ensure realistic ranges
  protein = Math.max(50, Math.min(protein, 200)); // 50-200g protein
  const proteinCalories = protein * 4;

  const fat = (calories * fatPercent) / 9;
  const carbCalories = calories - proteinCalories - (fat * 9);
  const carbs = Math.max(0, carbCalories) / 4;

  // If carbs are too low, adjust fat percentage down
  if (carbs < 100 && normalizedGoal !== "gain") {
    const adjustedFatPercent = Math.max(0.20, fatPercent - 0.05);
    const adjustedFat = (calories * adjustedFatPercent) / 9;
    const adjustedCarbCalories = calories - proteinCalories - (adjustedFat * 9);
    const adjustedCarbs = Math.max(0, adjustedCarbCalories) / 4;

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(adjustedCarbs),
      fat: Math.round(adjustedFat),
    };
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
}

module.exports = { calculateNutrition };