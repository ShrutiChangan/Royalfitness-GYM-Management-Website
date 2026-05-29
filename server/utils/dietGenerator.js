const { getCleanFoodData } = require("./dataProcessor");
const { scoreMultipleFoods } = require("./mlModel");

const MEAL_SPLIT = {
  breakfast: 0.20,  // Reduced from 0.25
  lunch: 0.40,      // Increased from 0.35
  dinner: 0.35,     // Increased from 0.30
  snacks: 0.05,     // Reduced from 0.10
};

const MEAL_TYPE_MAP = {
  breakfast: "breakfast",
  lunch: "lunch/dinner",
  dinner: "lunch/dinner",
  snacks: "snacks",
};

const getMealCandidates = (foods, meal, dietType, usedNames) => {
  const candidates = foods
    .filter(f => f.meal_type === MEAL_TYPE_MAP[meal])
    .filter(f => dietType === "any" || f.diet_type === dietType)
    .filter(f => !usedNames.has(f.name))
    .filter(f => {
      const name = f.name.toLowerCase();
      if (meal === "breakfast" && /iced tea|iced coffee|soda|cola|soft drink/.test(name)) return false;
      if (meal === "dinner" && /hot cocoa|cocoa/.test(name)) return false;
      if (meal === "dinner" && /raita|buttermilk/.test(name)) return false;
      if (meal === "lunch" && /sandwich/.test(name)) return false;
      // avoid sugary drink-like items in main meals
      if ((meal === "lunch" || meal === "dinner") && /cola|soda|ice cream|milk shake|pastry/.test(name)) return false;
      // prefer healthy breakfast staples
      if (meal === "breakfast" && /popcorn/.test(name)) return false; // avoid snack mismatch
      return true;
    })
    .slice(0, 15); // Increased from 5 to 15 for better selection

  if (candidates.length === 0) {
    console.warn(`[Fallback] No candidates available for ${meal}`);
  }
  return candidates;
};

const chooseBestCombination = (candidates, targetCalories, mealType = null) => {
  if (!candidates || candidates.length === 0) return [];

  const isCarbFile = (item) => /\b(rice|roti|chapati|puri|poori|paratha|bread|pulao|biryani|khichdi|idli|dosa|poha|upma)\b/.test(item.name.toLowerCase());
  const isProteinFile = (item) => /\b(dal|paneer|tofu|lentil|bean|chicken|fish|egg|meat|soy|yogurt|curd|raita)\b/.test(item.name.toLowerCase());
  const isVegetableFile = (item) => /\b(sabzi|vegetable|curry|greens|spinach|cauliflower|broccoli|carrot|peas|mushroom|salad|bhaji|sabji)\b/.test(item.name.toLowerCase());
  const isSaladFile = (item) => /\b(salad)\b/.test(item.name.toLowerCase());
  const preferBreakfastFood = (item) => /\b(idli|dosa|poha|upma|besan|chilla|oats|shake|smoothie)\b/.test(item.name.toLowerCase());
  const avoidDinnerExtras = (item) => /\b(raita|buttermilk|sandwich|hot cocoa|cocoa)\b/.test(item.name.toLowerCase());

  let available = candidates.slice();

  // Meal-specific filters
  if (mealType === "snacks") {
    available = available.filter(f => f.calories < 350);
    if (available.length === 0) available = candidates.slice().filter(f => f.fat <= 60);
  } else if (mealType === "breakfast") {
    available = available.filter(f => f.calories < 500);
    if (available.length === 0) available = candidates.slice().sort((a, b) => a.calories - b.calories).slice(0, 25);
  } else {
    available = available.filter(f => f.fat < 55);
    if (available.length < 3) available = candidates.slice().sort((a, b) => a.fat - b.fat).slice(0, 25);
  }

  // Sort by protein density
  if (available.length > 1) available = available.sort((a, b) => (b.protein - b.fat) - (a.protein - a.fat)).slice(0, 25);

  const validCombos = [];

  const calc = (combo) => {
    const calories = combo.reduce((s, f) => s + f.calories, 0);
    const protein = combo.reduce((s, f) => s + f.protein, 0);
    const carbs = combo.reduce((s, f) => s + f.carbs, 0);
    const fat = combo.reduce((s, f) => s + f.fat, 0);
    return {
      items: combo,
      calories,
      protein,
      carbs,
      fat,
      hasProteinItem: combo.some(isProteinFile),
      hasCarb: combo.some(isCarbFile),
      hasVegetable: combo.some(isVegetableFile),
      hasSalad: combo.some(isSaladFile),
      avgProteinPerItem: protein / combo.length,
      isHealthy: combo.every(f => f.fat < 55 || mealType === "snacks"),
    };
  };

  const addCombo = (combo) => {
    // Prevent exact name duplicates in the same combo
    const names = combo.map(item => item.name.toLowerCase());
    if (new Set(names).size !== names.length) return;

    const c = calc(combo);
    if (c.items.length < 1 || c.items.length > 4) return;
    if (!c.hasProteinItem && c.calories > 280) return;
    if (!c.isHealthy) return;
    if (c.fat >= c.protein && mealType !== "snacks") return;

    if ((mealType === "lunch" || mealType === "dinner") && (!c.hasCarb || !c.hasProteinItem)) return;
    if (mealType === "lunch" && !c.hasVegetable && !c.hasSalad) return;

    // encourage inclusion of salad and curd-like items in lunch
    if (mealType === "lunch" && !c.hasSalad) c.scoreBonus = -5;
    if (mealType === "lunch" && !c.hasProteinItem) c.scoreBonus = -10;

    validCombos.push(c);
  };

  const combineAndAdd = (items) => addCombo(items);

  const limit = Math.min(available.length, 20);

  for (let i = 0; i < limit; i++) combineAndAdd([available[i]]);
  for (let i = 0; i < limit; i++) for (let j = i + 1; j < limit; j++) combineAndAdd([available[i], available[j]]);
  for (let i = 0; i < Math.min(available.length, 15); i++)
    for (let j = i + 1; j < Math.min(available.length, 15); j++)
      for (let k = j + 1; k < Math.min(available.length, 15); k++)
        combineAndAdd([available[i], available[j], available[k]]);
  for (let i = 0; i < Math.min(available.length, 10); i++)
    for (let j = i + 1; j < Math.min(available.length, 10); j++)
      for (let k = j + 1; k < Math.min(available.length, 10); k++)
        for (let l = k + 1; l < Math.min(available.length, 10); l++)
          combineAndAdd([available[i], available[j], available[k], available[l]]);

  if (validCombos.length === 0) {
    console.warn(`[Fallback] Using top single item for ${mealType}`);
    if (available.length > 0) {
      const bestItem = available.reduce((best, current) => {
        const bestDiff = Math.abs(best.calories - targetCalories);
        const currentDiff = Math.abs(current.calories - targetCalories);
        return currentDiff < bestDiff ? current : best;
      });
      return [bestItem];
    }
    return [];
  }

  let chosenCombo = null;
  let bestScore = Infinity;

  validCombos.forEach((combo) => {
    const caloricDiff = Math.abs(combo.calories - targetCalories);
    const highProteinBonus = combo.protein > combo.fat ? 0 : 20;
    const fatToProteinRatio = combo.fat / (combo.protein + 0.1);
    const fatRatioPenalty = fatToProteinRatio > 0.8 ? (fatToProteinRatio - 0.8) * 60 : 0;
    const breakfastBonus = (mealType === "breakfast" && combo.items.some(preferBreakfastFood)) ? -12 : 0;
    const dinnerPenalty = (mealType === "dinner" && combo.items.some(avoidDinnerExtras)) ? 40 : 0;
    const lunchPenalty = (mealType === "lunch" && combo.items.some(item => /sandwich/.test(item.name.toLowerCase()))) ? 40 : 0;
    const mealStyleBonus = (mealType === "lunch" && combo.hasSalad ? -10 : 0) +
      ((mealType === "breakfast" && combo.items.some(item => /shake|smoothie|milk|oats/.test(item.name.toLowerCase()))) ? -8 : 0) +
      breakfastBonus + dinnerPenalty + lunchPenalty;

    const mlScoreTotal = combo.items.reduce((sum, f) => sum + (f.mlScore || 0), 0);
    const mlBonus = (mlScoreTotal / combo.items.length) * 30;

    const score = caloricDiff + fatRatioPenalty + highProteinBonus + mealStyleBonus - mlBonus;

    if (score < bestScore) {
      bestScore = score;
      chosenCombo = combo;
    }
  });

  return chosenCombo ? chosenCombo.items : [];
};

const buildMeals = async (foods, targets, dietType, goal) => {
  const usedNames = new Set();
  const mealTargets = {
    breakfast: Math.round(targets.calories * MEAL_SPLIT.breakfast),
    lunch: Math.round(targets.calories * MEAL_SPLIT.lunch),
    dinner: Math.round(targets.calories * MEAL_SPLIT.dinner),
    snacks: Math.round(targets.calories * MEAL_SPLIT.snacks),
  };

  const meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };

  for (const meal of Object.keys(meals)) {
    let candidates = getMealCandidates(foods, meal, dietType, usedNames);

    let scoredCandidates = candidates;

const safeML = async () => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("ML Timeout")), 4000)
  );

  return Promise.race([
    scoreMultipleFoods(candidates, targets, goal),
    timeout
  ]);
};

try {
  console.log(`➡️ Running ML for ${meal}`);

  scoredCandidates = await safeML();

  console.log(`✅ ML done for ${meal}`);
} catch (err) {
  console.error(`⚠️ ML failed for ${meal}:`, err.message);

  scoredCandidates = candidates.map(f => ({
    ...f,
    mlScore: 0.1
  }));
}

    const selected = chooseBestCombination(scoredCandidates, mealTargets[meal], meal);
    selected.forEach(item => usedNames.add(item.name));

    if (selected.length === 0) console.warn(`[Fallback] No items selected for ${meal}`);
    meals[meal] = selected;
  }

  return { meals, mealTargets };
};

const calculateTotals = (meals) => {
  const totals = { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalMLScore: 0, foodCount: 0 };

  Object.values(meals).forEach(mealList => {
    mealList.forEach(item => {
      totals.totalCalories += item.calories;
      totals.totalProtein += item.protein;
      totals.totalCarbs += item.carbs;
      totals.totalFat += item.fat;
      totals.totalMLScore += item.mlScore || 0;
      totals.foodCount += 1;
    });
  });

  totals.avgMLScore = totals.foodCount > 0 ? totals.totalMLScore / totals.foodCount : 0;
  return totals;
};

const generateDietPlanFromCleanData = async ({ targetCalories, targetProtein, targetCarbs, targetFat, dietType = "veg", goal = "maintenance" }) => {
  if (typeof targetCalories !== "number" || targetCalories <= 0) throw new Error("targetCalories must be positive");
  if (!["veg", "non-veg", "any"].includes(dietType)) throw new Error("Invalid dietType");

  const foods = await getCleanFoodData();
  if (!Array.isArray(foods) || foods.length === 0) throw new Error("No food data available");

  const { meals, mealTargets } = await buildMeals(foods, { calories: targetCalories, protein: targetProtein, carbs: targetCarbs, fat: targetFat }, dietType, goal);
  const totals = calculateTotals(meals);

  return { meals, totals, mealTargets };
};

const generateDiet = async (targets, dietType, goal) => {
  return generateDietPlanFromCleanData({
    targetCalories: targets.calories,
    targetProtein: targets.protein,
    targetCarbs: targets.carbs,
    targetFat: targets.fat,
    dietType,
    goal,
  });
};

module.exports = { generateDietPlanFromCleanData, generateDiet };