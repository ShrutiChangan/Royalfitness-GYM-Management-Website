/**
 * gymDietFallback.js
 *
 * Single-file fallback diet generator for a Gym Management App
 * ------------------------------------------------------------
 * Inputs:
 *  - age
 *  - heightCm
 *  - weightKg
 *  - gender: 'male' | 'female'
 *  - activityLevel: 'sedentary' | 'moderate' | 'active'
 *  - goal: 'weight_loss' | 'muscle_gain' | 'maintenance'
 *  - dietType: 'veg' | 'non-veg'
 *
 * Features:
 *  - Generates nutritionally safer fallback plans
 *  - Indian diet templates
 *  - Breakfast / Lunch / Dinner / Snacks
 *  - Calories + protein + carbs + fat
 *  - Validation helpers
 *  - Generate 1 plan or 50 plans
 *
 * Notes:
 *  - Intended as a general fallback system for adults.
 *  - If age < 18, the file still works, but returns a caution note.
 *  - This is not a medical prescription.
 */

// =========================
// 1) CONSTANTS & UTILITIES
// =========================

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  moderate: 1.55,
  active: 1.725,
};

const GOAL_CALORIE_ADJUSTMENT = {
  weight_loss: -400,
  maintenance: 0,
  muscle_gain: 300,
};

const AGE_GROUPS = [
  { label: "18-25", min: 18, max: 25 },
  { label: "26-35", min: 26, max: 35 },
  { label: "36-45", min: 36, max: 45 },
  { label: "46-55", min: 46, max: 55 },
  { label: "56+", min: 56, max: 120 },
];

function round1(n) {
  return Math.round(n * 10) / 10;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function sumMealNutrition(items) {
  return items.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function combineTotals(meals) {
  const allMeals = Object.values(meals).flat();
  const totals = sumMealNutrition(allMeals);
  return {
    totalCalories: Math.round(totals.calories),
    totalProtein: round1(totals.protein),
    totalCarbs: round1(totals.carbs),
    totalFat: round1(totals.fat),
  };
}

function getAgeGroup(age) {
  const group = AGE_GROUPS.find((g) => age >= g.min && age <= g.max);
  return group ? group.label : "18-25";
}

function getMealLabel(goal) {
  switch (goal) {
    case "weight_loss":
      return { proteinPct: 30, carbsPct: 40, fatPct: 30 };
    case "muscle_gain":
      return { proteinPct: 25, carbsPct: 50, fatPct: 25 };
    case "maintenance":
    default:
      return { proteinPct: 25, carbsPct: 45, fatPct: 30 };
  }
}

// =====================================
// 2) CALORIE + MACRO TARGET CALCULATION
// =====================================

function estimateBMR({ age, heightCm, weightKg, gender }) {
  // Mifflin-St Jeor Equation
  // men: 10W + 6.25H - 5A + 5
  // women: 10W + 6.25H - 5A - 161
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

function estimateTargetCalories(profile) {
  const { age, heightCm, weightKg, gender, activityLevel, goal } = profile;
  const bmr = estimateBMR({ age, heightCm, weightKg, gender });
  const tdee = bmr * (ACTIVITY_FACTORS[activityLevel] || 1.2);
  let target = tdee + (GOAL_CALORIE_ADJUSTMENT[goal] || 0);

  // Safer generic floors for fallback use, not strict clinical rules
  const minFloor = gender === "male" ? 1600 : 1400;
  const maxCeiling = goal === "muscle_gain" ? 3400 : 2800;

  target = clamp(Math.round(target), minFloor, maxCeiling);

  // Small age adjustment for older adults
  if (age >= 46) target = Math.max(minFloor, target - 75);

  return target;
}

function estimateMacroTargets(profile, targetCalories) {
  const { weightKg, goal } = profile;

  // Goal-aware protein target
  let proteinPerKg;
  if (goal === "weight_loss") proteinPerKg = 1.6;
  else if (goal === "muscle_gain") proteinPerKg = 1.8;
  else proteinPerKg = 1.3;

  // Fat target
  let fatPct;
  if (goal === "weight_loss") fatPct = 0.28;
  else if (goal === "muscle_gain") fatPct = 0.25;
  else fatPct = 0.28;

  let proteinG = weightKg * proteinPerKg;
  let fatG = (targetCalories * fatPct) / 9;
  let proteinCalories = proteinG * 4;
  let fatCalories = fatG * 9;
  let carbsCalories = targetCalories - proteinCalories - fatCalories;
  let carbsG = carbsCalories / 4;

  // Keep carbs from dropping too low in a generic fitness app
  if (carbsG < 130) {
    carbsG = 130;
    const remainingCalories = targetCalories - carbsG * 4 - fatG * 9;
    proteinG = Math.max(weightKg * 1.2, remainingCalories / 4);
  }

  // Final cleanup
  proteinG = round1(Math.max(proteinG, weightKg * 0.8));
  fatG = round1(Math.max(fatG, 40));
  carbsG = round1(Math.max(carbsG, 130));

  const proteinPct = round1(((proteinG * 4) / targetCalories) * 100);
  const carbsPct = round1(((carbsG * 4) / targetCalories) * 100);
  const fatPctFinal = round1(((fatG * 9) / targetCalories) * 100);

  return {
    targetCalories,
    targetProtein: proteinG,
    targetCarbs: carbsG,
    targetFat: fatG,
    macroPercentages: {
      proteinPct,
      carbsPct,
      fatPct: fatPctFinal,
    },
  };
}

// ======================
// 3) FOOD TEMPLATE POOLS
// ======================

const FOOD_DB = {
  veg: {
    breakfast: [
      [
        { name: "Oats with Milk", calories: 280, protein: 11, carbs: 40, fat: 7 },
        { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
      ],
      [
        { name: "Poha", calories: 300, protein: 6, carbs: 50, fat: 8 },
        { name: "Curd", calories: 80, protein: 4, carbs: 6, fat: 4 },
      ],
      [
        { name: "Upma", calories: 290, protein: 7, carbs: 45, fat: 8 },
        { name: "Apple", calories: 80, protein: 0.4, carbs: 21, fat: 0.2 },
      ],
      [
        { name: "Idli (3) with Sambar", calories: 320, protein: 11, carbs: 52, fat: 6 },
      ],
      [
        { name: "Besan Chilla (2)", calories: 300, protein: 14, carbs: 30, fat: 10 },
        { name: "Mint Chutney", calories: 30, protein: 1, carbs: 3, fat: 1 },
      ],
      [
        { name: "Paneer Sandwich", calories: 340, protein: 16, carbs: 34, fat: 14 },
      ],
      [
        { name: "Vegetable Dalia", calories: 280, protein: 8, carbs: 48, fat: 6 },
      ],
      [
        { name: "Aloo Paratha (2) with Curd", calories: 420, protein: 11, carbs: 50, fat: 18 },
      ],
      [
        { name: "Sprouts Chaat", calories: 240, protein: 14, carbs: 30, fat: 6 },
        { name: "Orange", calories: 60, protein: 1, carbs: 15, fat: 0.2 },
      ],
      [
        { name: "Peanut Butter Toast (2)", calories: 310, protein: 12, carbs: 28, fat: 16 },
        { name: "Milk", calories: 120, protein: 6, carbs: 10, fat: 6 },
      ],
    ],
    lunch: [
      [
        { name: "Moong Dal", calories: 190, protein: 13, carbs: 26, fat: 4 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
        { name: "Mixed Vegetable Sabzi", calories: 140, protein: 4, carbs: 16, fat: 6 },
      ],
      [
        { name: "Rajma", calories: 260, protein: 13, carbs: 35, fat: 7 },
        { name: "Rice (1 cup)", calories: 210, protein: 4, carbs: 45, fat: 0.5 },
        { name: "Salad", calories: 50, protein: 2, carbs: 8, fat: 1 },
      ],
      [
        { name: "Chana Masala", calories: 280, protein: 14, carbs: 38, fat: 8 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
      ],
      [
        { name: "Paneer Bhurji", calories: 300, protein: 20, carbs: 10, fat: 19 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
        { name: "Cucumber Salad", calories: 35, protein: 1, carbs: 6, fat: 0.4 },
      ],
      [
        { name: "Khichdi", calories: 340, protein: 12, carbs: 55, fat: 7 },
        { name: "Curd", calories: 80, protein: 4, carbs: 6, fat: 4 },
      ],
      [
        { name: "Dal Tadka", calories: 230, protein: 14, carbs: 28, fat: 7 },
        { name: "Rice (1 cup)", calories: 210, protein: 4, carbs: 45, fat: 0.5 },
      ],
      [
        { name: "Soybean Curry", calories: 260, protein: 20, carbs: 18, fat: 12 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
      ],
      [
        { name: "Paneer Pulao", calories: 420, protein: 16, carbs: 52, fat: 16 },
        { name: "Salad", calories: 50, protein: 2, carbs: 8, fat: 1 },
      ],
      [
        { name: "Sambar Rice", calories: 360, protein: 11, carbs: 58, fat: 8 },
      ],
      [
        { name: "Tofu Stir Fry", calories: 250, protein: 18, carbs: 14, fat: 13 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
      ],
    ],
    dinner: [
      [
        { name: "Paneer Tikka", calories: 260, protein: 22, carbs: 9, fat: 15 },
        { name: "Green Salad", calories: 50, protein: 2, carbs: 8, fat: 1 },
      ],
      [
        { name: "Vegetable Soup", calories: 120, protein: 5, carbs: 16, fat: 4 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
        { name: "Paneer Bhurji", calories: 260, protein: 18, carbs: 9, fat: 17 },
      ],
      [
        { name: "Dal", calories: 190, protein: 12, carbs: 25, fat: 5 },
        { name: "Rice (1 cup)", calories: 210, protein: 4, carbs: 45, fat: 0.5 },
        { name: "Salad", calories: 50, protein: 2, carbs: 8, fat: 1 },
      ],
      [
        { name: "Palak Paneer", calories: 280, protein: 18, carbs: 10, fat: 18 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
      ],
      [
        { name: "Veg Pulao", calories: 350, protein: 8, carbs: 56, fat: 9 },
        { name: "Curd", calories: 80, protein: 4, carbs: 6, fat: 4 },
      ],
      [
        { name: "Tofu Curry", calories: 240, protein: 17, carbs: 12, fat: 14 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
      ],
      [
        { name: "Rajma", calories: 260, protein: 13, carbs: 35, fat: 7 },
        { name: "Rice (1 cup)", calories: 210, protein: 4, carbs: 45, fat: 0.5 },
      ],
      [
        { name: "Mixed Veg Curry", calories: 180, protein: 5, carbs: 20, fat: 9 },
        { name: "Roti (3)", calories: 330, protein: 9, carbs: 57, fat: 6 },
      ],
      [
        { name: "Moong Chilla (2)", calories: 280, protein: 16, carbs: 24, fat: 9 },
        { name: "Salad", calories: 50, protein: 2, carbs: 8, fat: 1 },
      ],
      [
        { name: "Paneer Rice Bowl", calories: 430, protein: 20, carbs: 48, fat: 17 },
      ],
    ],
    snacks: [
      [{ name: "Apple", calories: 80, protein: 0.4, carbs: 21, fat: 0.2 }],
      [{ name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.3 }],
      [{ name: "Almonds (10)", calories: 70, protein: 2.5, carbs: 2.5, fat: 6 }],
      [{ name: "Roasted Chana", calories: 130, protein: 6, carbs: 18, fat: 2 }],
      [{ name: "Curd", calories: 80, protein: 4, carbs: 6, fat: 4 }],
      [{ name: "Buttermilk", calories: 50, protein: 2, carbs: 5, fat: 2 }],
      [{ name: "Peanuts (25g)", calories: 150, protein: 7, carbs: 5, fat: 12 }],
      [{ name: "Fruit Bowl", calories: 110, protein: 2, carbs: 26, fat: 0.5 }],
    ],
  },

  "non-veg": {
    breakfast: [
      [
        { name: "Boiled Eggs (2)", calories: 140, protein: 12, carbs: 1, fat: 10 },
        { name: "Whole Wheat Toast (2)", calories: 160, protein: 6, carbs: 28, fat: 2 },
      ],
      [
        { name: "Omelette (3 eggs)", calories: 240, protein: 18, carbs: 3, fat: 17 },
        { name: "Toast (2)", calories: 160, protein: 6, carbs: 28, fat: 2 },
      ],
      [
        { name: "Egg Bhurji", calories: 220, protein: 16, carbs: 5, fat: 14 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
      ],
      [
        { name: "Oats with Milk", calories: 280, protein: 11, carbs: 40, fat: 7 },
        { name: "Boiled Egg", calories: 70, protein: 6, carbs: 0.6, fat: 5 },
      ],
      [
        { name: "Chicken Sandwich", calories: 330, protein: 22, carbs: 30, fat: 12 },
      ],
      [
        { name: "Poha", calories: 300, protein: 6, carbs: 50, fat: 8 },
        { name: "Boiled Eggs (2)", calories: 140, protein: 12, carbs: 1, fat: 10 },
      ],
      [
        { name: "Idli (3) with Sambar", calories: 320, protein: 11, carbs: 52, fat: 6 },
        { name: "Egg White Omelette", calories: 90, protein: 16, carbs: 1, fat: 1 },
      ],
      [
        { name: "Peanut Butter Toast (2)", calories: 310, protein: 12, carbs: 28, fat: 16 },
        { name: "Milk", calories: 120, protein: 6, carbs: 10, fat: 6 },
      ],
      [
        { name: "Scrambled Eggs (3)", calories: 210, protein: 18, carbs: 2, fat: 15 },
        { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
      ],
      [
        { name: "Egg Paratha Roll", calories: 380, protein: 18, carbs: 32, fat: 18 },
      ],
    ],
    lunch: [
      [
        { name: "Grilled Chicken Breast (150g)", calories: 248, protein: 38, carbs: 0, fat: 9 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
        { name: "Salad", calories: 50, protein: 2, carbs: 8, fat: 1 },
      ],
      [
        { name: "Chicken Curry", calories: 300, protein: 28, carbs: 8, fat: 16 },
        { name: "Rice (1 cup)", calories: 210, protein: 4, carbs: 45, fat: 0.5 },
      ],
      [
        { name: "Fish Curry", calories: 240, protein: 26, carbs: 6, fat: 12 },
        { name: "Rice (1 cup)", calories: 210, protein: 4, carbs: 45, fat: 0.5 },
      ],
      [
        { name: "Egg Curry (3 eggs)", calories: 280, protein: 18, carbs: 8, fat: 18 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
      ],
      [
        { name: "Chicken Pulao", calories: 430, protein: 22, carbs: 52, fat: 14 },
        { name: "Salad", calories: 50, protein: 2, carbs: 8, fat: 1 },
      ],
      [
        { name: "Grilled Fish", calories: 180, protein: 32, carbs: 0, fat: 5 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
        { name: "Veg Stir Fry", calories: 120, protein: 4, carbs: 15, fat: 5 },
      ],
      [
        { name: "Chicken Dal Combo", calories: 360, protein: 30, carbs: 24, fat: 12 },
        { name: "Rice (1 cup)", calories: 210, protein: 4, carbs: 45, fat: 0.5 },
      ],
      [
        { name: "Keema with Roti (2)", calories: 460, protein: 28, carbs: 34, fat: 20 },
      ],
      [
        { name: "Chicken Khichdi", calories: 390, protein: 24, carbs: 46, fat: 10 },
      ],
      [
        { name: "Tandoori Chicken", calories: 300, protein: 35, carbs: 4, fat: 14 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
      ],
    ],
    dinner: [
      [
        { name: "Grilled Fish (150g)", calories: 180, protein: 32, carbs: 0, fat: 5 },
        { name: "Green Salad", calories: 50, protein: 2, carbs: 8, fat: 1 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
      ],
      [
        { name: "Chicken Curry", calories: 300, protein: 28, carbs: 8, fat: 16 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
      ],
      [
        { name: "Egg Bhurji", calories: 220, protein: 16, carbs: 5, fat: 14 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
        { name: "Salad", calories: 50, protein: 2, carbs: 8, fat: 1 },
      ],
      [
        { name: "Fish Curry", calories: 240, protein: 26, carbs: 6, fat: 12 },
        { name: "Rice (1 cup)", calories: 210, protein: 4, carbs: 45, fat: 0.5 },
      ],
      [
        { name: "Chicken Soup", calories: 160, protein: 18, carbs: 6, fat: 6 },
        { name: "Paneer Salad", calories: 220, protein: 14, carbs: 8, fat: 14 },
      ],
      [
        { name: "Grilled Chicken", calories: 248, protein: 38, carbs: 0, fat: 9 },
        { name: "Veg Stir Fry", calories: 120, protein: 4, carbs: 15, fat: 5 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
      ],
      [
        { name: "Egg Curry (2 eggs)", calories: 220, protein: 12, carbs: 6, fat: 14 },
        { name: "Rice (1 cup)", calories: 210, protein: 4, carbs: 45, fat: 0.5 },
      ],
      [
        { name: "Chicken Rice Bowl", calories: 450, protein: 28, carbs: 48, fat: 14 },
      ],
      [
        { name: "Fish + Salad", calories: 230, protein: 27, carbs: 8, fat: 10 },
        { name: "Roti (2)", calories: 220, protein: 6, carbs: 38, fat: 4 },
      ],
      [
        { name: "Tandoori Chicken", calories: 300, protein: 35, carbs: 4, fat: 14 },
        { name: "Salad", calories: 50, protein: 2, carbs: 8, fat: 1 },
      ],
    ],
    snacks: [
      [{ name: "Boiled Egg", calories: 70, protein: 6, carbs: 0.6, fat: 5 }],
      [{ name: "Apple", calories: 80, protein: 0.4, carbs: 21, fat: 0.2 }],
      [{ name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.3 }],
      [{ name: "Curd", calories: 80, protein: 4, carbs: 6, fat: 4 }],
      [{ name: "Roasted Chana", calories: 130, protein: 6, carbs: 18, fat: 2 }],
      [{ name: "Buttermilk", calories: 50, protein: 2, carbs: 5, fat: 2 }],
      [{ name: "Peanuts (25g)", calories: 150, protein: 7, carbs: 5, fat: 12 }],
      [{ name: "Fruit Bowl", calories: 110, protein: 2, carbs: 26, fat: 0.5 }],
    ],
  },
};

// =======================================
// 4) PLAN BUILDING / SCALING / VALIDATION
// =======================================

function pickTemplate(pool, index) {
  return deepCopy(pool[index % pool.length]);
}

function scaleMealItems(items, factor) {
  return items.map((item) => ({
    ...item,
    calories: Math.max(20, Math.round(item.calories * factor)),
    protein: Math.max(0.5, round1(item.protein * factor)),
    carbs: Math.max(0.5, round1(item.carbs * factor)),
    fat: Math.max(0.1, round1(item.fat * factor)),
  }));
}

function buildBaseMeals(dietType, variantIndex) {
  const db = FOOD_DB[dietType];
  return {
    breakfast: pickTemplate(db.breakfast, variantIndex),
    lunch: pickTemplate(db.lunch, variantIndex + 3),
    dinner: pickTemplate(db.dinner, variantIndex + 6),
    snacks: pickTemplate(db.snacks, variantIndex + 2),
  };
}

function scalePlanToTarget(meals, targetCalories, goal) {
  const currentTotals = combineTotals(meals);
  let factor = targetCalories / currentTotals.totalCalories;

  // Goal-sensitive scaling boundaries
  if (goal === "weight_loss") factor = clamp(factor, 0.9, 1.15);
  else if (goal === "muscle_gain") factor = clamp(factor, 1.0, 1.4);
  else factor = clamp(factor, 0.95, 1.25);

  const scaled = {
    breakfast: scaleMealItems(meals.breakfast, factor),
    lunch: scaleMealItems(meals.lunch, factor),
    dinner: scaleMealItems(meals.dinner, factor),
    snacks: scaleMealItems(meals.snacks, factor),
  };

  return scaled;
}

function mealShareFactor(goal, mealType) {
  // Fine-tuning meal balance
  if (goal === "muscle_gain") {
    if (mealType === "breakfast") return 1.05;
    if (mealType === "lunch") return 1.1;
    if (mealType === "dinner") return 1.05;
    return 1.1;
  }

  if (goal === "weight_loss") {
    if (mealType === "breakfast") return 0.95;
    if (mealType === "lunch") return 1.0;
    if (mealType === "dinner") return 0.9;
    return 0.85;
  }

  return 1.0;
}

function rebalanceMeals(meals, goal) {
  const rebalanced = {};
  for (const [mealType, items] of Object.entries(meals)) {
    rebalanced[mealType] = scaleMealItems(items, mealShareFactor(goal, mealType));
  }
  return rebalanced;
}

function calculatePlanNutrition(plan) {
  plan.totals = combineTotals(plan.meals);

  const cals = plan.totals.totalCalories || 1;
  plan.proportions = {
    proteinPct: round1(((plan.totals.totalProtein * 4) / cals) * 100),
    carbsPct: round1(((plan.totals.totalCarbs * 4) / cals) * 100),
    fatPct: round1(((plan.totals.totalFat * 9) / cals) * 100),
  };

  return plan;
}

function validateDietPlan(plan, profile) {
  const { totalCalories, totalProtein, totalCarbs, totalFat } = plan.totals;
  const target = plan.targets;
  const weightKg = profile.weightKg;

  const proteinMin = round1(weightKg * 0.8);
  const proteinGoalFloor =
    profile.goal === "muscle_gain"
      ? round1(weightKg * 1.6)
      : profile.goal === "weight_loss"
      ? round1(weightKg * 1.2)
      : round1(weightKg * 1.0);

  const proteinPct = plan.proportions.proteinPct;
  const carbsPct = plan.proportions.carbsPct;
  const fatPct = plan.proportions.fatPct;

  const checks = {
    caloriesNearTarget:
      totalCalories >= target.targetCalories * 0.88 &&
      totalCalories <= target.targetCalories * 1.12,

    proteinAboveMinimum: totalProtein >= proteinMin,
    proteinSupportsGoal: totalProtein >= proteinGoalFloor,

    carbsWithinBroadRange: carbsPct >= 35 && carbsPct <= 60,
    fatWithinBroadRange: fatPct >= 20 && fatPct <= 35,
    proteinWithinBroadRange: proteinPct >= 15 && proteinPct <= 35,

    includesBreakfast: plan.meals.breakfast.length > 0,
    includesLunch: plan.meals.lunch.length > 0,
    includesDinner: plan.meals.dinner.length > 0,
    includesSnack: plan.meals.snacks.length > 0,
  };

  const isBalanced =
    checks.proteinAboveMinimum &&
    checks.carbsWithinBroadRange &&
    checks.fatWithinBroadRange &&
    checks.proteinWithinBroadRange &&
    checks.includesBreakfast &&
    checks.includesLunch &&
    checks.includesDinner;

  return {
    isBalanced,
    checks,
    summary: {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      proteinMin,
      proteinGoalFloor,
      macroPercentages: {
        proteinPct,
        carbsPct,
        fatPct,
      },
    },
  };
}

// ======================
// 5) MAIN PLAN GENERATOR
// ======================

function normalizeProfile(profile) {
  const safe = {
    age: Number(profile.age) || 25,
    heightCm: Number(profile.heightCm) || 170,
    weightKg: Number(profile.weightKg) || 70,
    gender: profile.gender === "female" ? "female" : "male",
    activityLevel: ["sedentary", "moderate", "active"].includes(profile.activityLevel)
      ? profile.activityLevel
      : "moderate",
    goal: ["weight_loss", "muscle_gain", "maintenance"].includes(profile.goal)
      ? profile.goal
      : "maintenance",
    dietType: profile.dietType === "non-veg" ? "non-veg" : "veg",
  };

  return safe;
}

function createDietPlan(profile, variantIndex = 0) {
  const user = normalizeProfile(profile);
  const ageGroup = getAgeGroup(user.age);

  const targetCalories = estimateTargetCalories(user);
  const targets = estimateMacroTargets(user, targetCalories);

  let meals = buildBaseMeals(user.dietType, variantIndex);
  meals = scalePlanToTarget(meals, targetCalories, user.goal);
  meals = rebalanceMeals(meals, user.goal);

  const plan = {
    id: `diet_plan_${variantIndex + 1}`,
    profile: {
      ...user,
      ageGroup,
    },
    targets,
    meals,
    totals: {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    },
    proportions: {
      proteinPct: 0,
      carbsPct: 0,
      fatPct: 0,
    },
    notes: [],
  };

  calculatePlanNutrition(plan);

  if (user.age < 18) {
    plan.notes.push(
      "This fallback is designed mainly for adults. For users below 18, use professional pediatric/adolescent nutrition guidance."
    );
  }

  if (user.goal === "weight_loss") {
    plan.notes.push("Balanced fat-loss fallback: high satiety foods, decent protein, moderate carbs.");
  } else if (user.goal === "muscle_gain") {
    plan.notes.push("Muscle-gain fallback: higher calories, practical protein, and higher carbs.");
  } else {
    plan.notes.push("Maintenance fallback: balanced calories and mixed Indian meals.");
  }

  const validation = validateDietPlan(plan, user);
  plan.validation = validation;

  return plan;
}

// =================================
// 6) GENERATE 50 DIVERSE DIET PLANS
// =================================

function buildProfileVariants(baseProfile) {
  const normalized = normalizeProfile(baseProfile);

  const ageVariants = [22, 29, 38, 48, 58];
  const genders = ["male", "female"];
  const activities = ["sedentary", "moderate", "active"];
  const goals = ["weight_loss", "muscle_gain", "maintenance"];
  const diets = ["veg", "non-veg"];

  const profiles = [];

  for (const age of ageVariants) {
    for (const gender of genders) {
      for (const activityLevel of activities) {
        for (const goal of goals) {
          for (const dietType of diets) {
            profiles.push({
              age,
              heightCm:
                gender === "male"
                  ? normalized.heightCm || 172
                  : normalized.heightCm || 160,
              weightKg:
                goal === "muscle_gain"
                  ? gender === "male"
                    ? 74
                    : 60
                  : goal === "weight_loss"
                  ? gender === "male"
                    ? 78
                    : 66
                  : gender === "male"
                  ? 70
                  : 58,
              gender,
              activityLevel,
              goal,
              dietType,
            });
          }
        }
      }
    }
  }

  return profiles;
}

function generate50DietPlans(baseProfile = {}) {
  const variantProfiles = buildProfileVariants(baseProfile);
  const selected = variantProfiles.slice(0, 50);

  return selected.map((profile, index) => createDietPlan(profile, index));
}

// =======================================
// 7) COMPATIBLE SINGLE-FALLBACK ENTRYPOINT
// =======================================

function getFallbackDiet(userProfile) {
  return createDietPlan(userProfile, 0);
}

// ========================
// 8) OPTIONAL PRETTY PRINT
// ========================

function summarizePlan(plan) {
  return {
    id: plan.id,
    ageGroup: plan.profile.ageGroup,
    gender: plan.profile.gender,
    activityLevel: plan.profile.activityLevel,
    goal: plan.profile.goal,
    dietType: plan.profile.dietType,
    targetCalories: plan.targets.targetCalories,
    totals: plan.totals,
    proportions: plan.proportions,
    validation: plan.validation,
  };
}

// ==================
// 9) SAMPLE USAGE
// ==================
/*
const userProfile = {
  age: 24,
  heightCm: 170,
  weightKg: 68,
  gender: 'female',
  activityLevel: 'moderate',
  goal: 'weight_loss',
  dietType: 'veg'
};

const singlePlan = getFallbackDiet(userProfile);
console.log(JSON.stringify(singlePlan, null, 2));

const fiftyPlans = generate50DietPlans(userProfile);
console.log(fiftyPlans.length); // 50
console.log(JSON.stringify(summarizePlan(fiftyPlans[0]), null, 2));
*/

// =================
// 10) EXPORTS
// =================

module.exports = {
  getFallbackDiet,
  createDietPlan,
  generate50DietPlans,
  validateDietPlan,
  summarizePlan,
  estimateTargetCalories,
  estimateMacroTargets,
};