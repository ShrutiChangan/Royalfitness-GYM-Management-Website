const { calculateNutrition } = require("../utils/nutritionCalculator");
const { generateDiet } = require("../utils/dietGenerator");
const { refineDietPlan } = require("../utils/dietRefiner");
const { validateDietPlan } = require("../utils/dietValidator");
const { getFallbackDiet } = require("../utils/fallbackDiet");
const { generateDietPlanFromCleanData } = require("../utils/dietGenerator");
const { generateAIDiet } = require("../utils/openaiDiet");




// Global cache for foods - fetch from MongoDB only once
let cachedFoods = null;
let foodsLastFetched = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to filter out junk/sugar-heavy foods
const filterFoods = (foods) => {
  const junkKeywords = ["cake", "pastry", "icing", "chocolate", "cookies", "halwa", "burfi", "ladoo", "dessert", "sweet", "candy", "ice cream", "pudding", "jelly", "syrup"];

  return foods.filter(food => {
    const lowerName = food.name.toLowerCase();
    return !junkKeywords.some(keyword => lowerName.includes(keyword));
  });
};

// Helper function to assign meal types based on food characteristics
const assignMealType = (name, calories, protein, carbs, fat) => {
  const lowerName = name.toLowerCase();

  // Breakfast foods: low calorie, balanced macros, traditional breakfast items
  if (lowerName.includes("oats") || lowerName.includes("poha") || lowerName.includes("idli") ||
      lowerName.includes("dosa") || lowerName.includes("upma") || lowerName.includes("egg") ||
      lowerName.includes("milk") || lowerName.includes("tea") || lowerName.includes("coffee") ||
      lowerName.includes("bread") || lowerName.includes("toast") || lowerName.includes("cereal") ||
      lowerName.includes("pancake") || lowerName.includes("fruit") || lowerName.includes("juice")) {
    return ["breakfast"];
  }

  // Lunch/Dinner foods: main meals, higher calories, balanced nutrition
  if (lowerName.includes("rice") || lowerName.includes("roti") || lowerName.includes("dal") ||
      lowerName.includes("curry") || lowerName.includes("paneer") || lowerName.includes("chicken") ||
      lowerName.includes("fish") || lowerName.includes("meat") || lowerName.includes("biryani") ||
      lowerName.includes("pulao") || lowerName.includes("khichdi") || lowerName.includes("sambar") ||
      lowerName.includes("rasam") || lowerName.includes("thali") || lowerName.includes("masala") ||
      lowerName.includes("sabzi") || lowerName.includes("vegetable")) {
    return ["lunch", "dinner"];
  }

  // Snacks: nuts, light items, moderate calories
  if (lowerName.includes("nuts") || lowerName.includes("chips") || lowerName.includes("popcorn") ||
      lowerName.includes("protein shake") || lowerName.includes("smoothie") || lowerName.includes("yogurt")) {
    return ["snacks"];
  }

  // Default based on nutrition profile
  if (calories < 200 && protein > carbs) return ["breakfast", "snacks"];
  if (calories > 300 && (protein > 10 || carbs > 30)) return ["lunch", "dinner"];
  return ["lunch"]; // fallback
};

// Helper function to score foods based on goal
const scoreFoods = (foods, goal) => {
  return foods.map(food => {
    // Estimate fiber and sugar if not available
    const fiber = food.fiber || (food.carbs * 0.1);
    const sugar = food.sugar || (food.carbs * 0.3);

    // New improved scoring formula
    let score = (food.protein * 2.5) +
                (fiber * 2) -
                (food.fat * 0.7) -
                (food.calories * 0.02) -
                (sugar * 1.5);

    // Additional scoring rules
    if (food.calories > 600) score -= 10;
    if (food.fat > 25) score -= 8;
    if (food.protein > 20) score += 10;
    if (food.carbs >= 20 && food.carbs <= 60) score += 5;

    // Goal-based adjustments (keep existing logic but adjust weights)
    if (goal === "weight_loss") {
      if (food.calories < 400) score += 8; // Prefer low calorie
      if (food.protein > 15) score += 4; // High protein helps preserve muscle
      score += (fiber * 0.5); // Extra fiber bonus for weight loss
    } else if (goal === "muscle_gain") {
      if (food.protein > 20) score += 12; // Prioritize high protein
      if (food.calories > 300) score += 4; // Higher calories for surplus
      score += (food.protein * 0.3); // Extra protein bonus
    } else if (goal === "maintenance") {
      if (food.calories >= 200 && food.calories <= 500) score += 4; // Balanced calories
      if (food.protein >= 10 && food.carbs >= 20) score += 4; // Balanced macros
    }

    return { ...food, score };
  }).sort((a, b) => b.score - a.score);
};

// Helper function to ensure balanced meals (protein + carbs minimum)
const ensureBalancedMeal = (foods) => {
  const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0);
  const totalCarbs = foods.reduce((sum, f) => sum + f.carbs, 0);

  const hasProtein = totalProtein > 10; // At least 10g total protein
  const hasCarbs = totalCarbs > 20; // At least 20g total carbs

  if (!hasProtein || !hasCarbs) {
    console.log(`⚠️ Meal lacks balance - total protein: ${totalProtein.toFixed(1)}g, total carbs: ${totalCarbs.toFixed(1)}g`);
  }

  return hasProtein && hasCarbs;
};

// 1. STRICT FOOD FILTER (CRITICAL FIX)
const isDrinkFood = (food) => {
  const lowerName = food.name.toLowerCase();
  return /\b(tea|coffee|espresso|drink|juice|soda|shake|smoothie)\b/.test(lowerName);
};

const isSoupOrLiquid = (food) => {
  const lowerName = food.name.toLowerCase();
  return /\b(soup|rasam|broth|juice|shake|smoothie|drink)\b/.test(lowerName);
};

const isValidFood = (food) => {
  const lowerName = food.name.toLowerCase();
  const invalidKeywords = ["powder", "masala", "chutney", "paste", "stock", "pickle", "pickled", "tea", "coffee", "espresso", "drink", "juice"];

  if (invalidKeywords.some(k => lowerName.includes(k))) return false;
  if (food.calories <= 0) return false;

  // For lunch/dinner main meal items must not be liquid/snack-type and not extremely low calories
  if ((food.mealType.includes("lunch") || food.mealType.includes("dinner")) && (food.calories < 50 || isSoupOrLiquid(food) || isDrinkFood(food))) {
    return false;
  }

  return true;
};

const filterValidFoods = (foods) => foods.filter(isValidFood);

const getFoodType = (food) => {
  const lowerName = food.name.toLowerCase();

  if (/\b(rice|roti|chapati|paratha|pulao|biryani|khichdi|idli|dosa|poha|upma|bread|sandwich)\b/.test(lowerName)) return "carb";
  if (/\b(dal|paneer|egg|chicken|fish|meat|tofu|soy|beans|lentil)\b/.test(lowerName)) return "protein";
  if (/\b(vegetable|sabzi|bhaji|curry|greens|spinach|cauliflower|broccoli|carrot|peas|potato|mushroom)\b/.test(lowerName)) return "vegetable";
  if (/\b(fruit|banana|apple|orange|grapes|mango|nuts|almonds|walnuts|raisins|dry fruit|snack|daliya|roasted)\b/.test(lowerName)) return "snack";
  if (/\b(tea|coffee|espresso|juice|shake|smoothie|milk)\b/.test(lowerName)) return "drink";

  return "other";
};

// 3. ADD PORTION SIZE (VERY IMPORTANT)
const assignPortion = (food) => {
  const lowerName = food.name.toLowerCase();

  if (lowerName.match(/\brot(i|as)?\b/)) return "2 roti";
  if (lowerName.includes("paratha")) return "1 paratha";
  if (lowerName.includes("rice") || lowerName.includes("pulao") || lowerName.includes("biryani") || lowerName.includes("khichdi")) return "1 cup cooked";
  if (lowerName.includes("dal") || lowerName.includes("sambar") || lowerName.includes("rasam")) return "1 cup";
  if (lowerName.includes("paneer")) return "100g";
  if (lowerName.includes("egg")) return "2 eggs";
  if (lowerName.includes("chicken") || lowerName.includes("fish") || lowerName.includes("meat")) return "100g";
  if (lowerName.includes("vegetable") || lowerName.includes("sabzi") || lowerName.includes("greens") || lowerName.includes("beans")) return "1 cup";

  if (food.calories > 450) return "70g";
  if (food.calories > 300) return "100g";
  if (food.calories > 150) return "150g";
  return "200g";
};

const isCarb = (food) => {
  const lowerName = food.name.toLowerCase();
  return /\b(rice|roti|chapati|paratha|pulao|biryani|khichdi|idli|dosa|chapathi)\b/.test(lowerName);
};

const isProtein = (food) => {
  const lowerName = food.name.toLowerCase();
  return /\b(dal|paneer|egg|chicken|fish|meat|tofu|soy|beans|lentil)\b/.test(lowerName);
};

const isVegetable = (food) => {
  const lowerName = food.name.toLowerCase();
  return /\b(vegetable|sabzi|bhaji|curry|greens|spinach|cauliflower|broccoli|beans|carrot|peas|potato|mushroom)\b/.test(lowerName);
};

const isLightFood = (food) => food.calories <= 250 && !isSoupOrLiquid(food);

// 2. ENFORCE REAL MEAL STRUCTURE (MOST IMPORTANT)
const buildBalancedMeal = (allFoods, mealType, mealTarget, selectedFoods) => {
  let candidates = allFoods
    .filter(food => food.mealType.includes(mealType))
    .filter(isValidFood)
    .filter(food => !selectedFoods || !selectedFoods.has(food.name));

  if (mealType === "lunch" || mealType === "dinner") {
    candidates = candidates.filter(food => !isSoupOrLiquid(food) && !isDrinkFood(food) && food.calories >= 50);
  }

  if (mealType === "breakfast") {
    candidates = candidates.filter(food => food.calories <= 400);
  }

  if (mealType === "snacks") {
    candidates = candidates.filter(food => getFoodType(food) === "snack" && food.calories <= 250 && !isSoupOrLiquid(food) && !isDrinkFood(food));
  }

  const picked = [];
  const addItem = (item) => {
    if (!item) return;
    if (picked.some(f => f.name === item.name)) return;
    const withPortion = { ...item, portion: assignPortion(item), description: getFoodDescription(item) };
    picked.push(withPortion);
    if (selectedFoods) selectedFoods.add(item.name);
  };

  const topByScore = scoreFoods(candidates, "maintenance");

  const pickFirst = (list) => {
    if (list && list.length > 0) addItem(list[0]);
  };

  if (mealType === "lunch" || mealType === "dinner") {
    const carb = candidates.filter(f => getFoodType(f) === "carb");
    const protein = candidates.filter(f => getFoodType(f) === "protein");
    const vegetable = candidates.filter(f => getFoodType(f) === "vegetable");

    pickFirst(carb);
    pickFirst(protein);
    pickFirst(vegetable);

    // Fallback style: fill with solids until 3 items
    const solidFallback = candidates.filter(f => getFoodType(f) !== "drink" && !isSoupOrLiquid(f)).slice(0, 3);
    for (const food of solidFallback) addItem(food);
  }

  if (mealType === "breakfast") {
    const breakfastSolid = candidates.filter(f => ["carb", "protein"].includes(getFoodType(f)) || /\b(poha|upma|oats|sandwich|egg)\b/.test(f.name.toLowerCase()));
    breakfastSolid.slice(0, 2).forEach(addItem);

    const optionalDrink = candidates.find(f => getFoodType(f) === "drink" || isDrinkFood(f));
    if (breakfastSolid.length > 0 && optionalDrink) addItem(optionalDrink);

    if (picked.filter(f => !isSoupOrLiquid(f) && !isDrinkFood(f)).length < 1 && breakfastSolid.length > 0) {
      breakfastSolid.slice(0, 1).forEach(addItem);
    }
  }

  if (mealType === "snacks") {
    let totalSnackCalories = 0;
    for (const food of candidates.sort((a, b) => a.calories - b.calories)) {
      if (totalSnackCalories + food.calories > 300) break;
      addItem(food);
      totalSnackCalories += food.calories;
      if (picked.length >= 3) break;
    }
  }

  // Final validity checks and correction
  const solidCount = picked.filter(f => !isSoupOrLiquid(f) && !isDrinkFood(f)).length;
  const isAllLiquid = picked.length > 0 && picked.every(f => isSoupOrLiquid(f) || isDrinkFood(f));

  // prevent invalid meal
  if ((mealType !== "snacks" && solidCount < 2) || isAllLiquid) {
    const alternative = candidates
      .filter(f => !isSoupOrLiquid(f) && !isDrinkFood(f))
      .slice(0, mealType === "snacks" ? 3 : 3);
    picked.length = 0;
    alternative.forEach(addItem);
  }

  // ensure lunch/dinner has required groups
  if (mealType === "lunch" || mealType === "dinner") {
    const hasCarb = picked.some(f => getFoodType(f) === "carb");
    const hasProtein = picked.some(f => getFoodType(f) === "protein");
    const hasVegetable = picked.some(f => getFoodType(f) === "vegetable");

    if (!hasCarb || !hasProtein || !hasVegetable) {
      picked.length = 0;
      pickFirst(candidates.filter(f => getFoodType(f) === "carb"));
      pickFirst(candidates.filter(f => getFoodType(f) === "protein"));
      pickFirst(candidates.filter(f => getFoodType(f) === "vegetable"));
    }
  }

  // Last fallback
  if (picked.length === 0 && candidates.length > 0) {
    candidates.slice(0, 3).forEach(addItem);
  }

  const actualCalories = picked.reduce((sum, f) => sum + f.calories, 0);

  return {
    foods: picked,
    targetCalories: mealTarget.calories,
    actualCalories,
  };
};

// Helper function to generate food descriptions
const getFoodDescription = (food) => {
  const descriptions = [];

  if (food.protein > 20) descriptions.push("High protein");
  else if (food.protein > 10) descriptions.push("Good protein source");

  if (food.calories < 200) descriptions.push("Low calorie");
  else if (food.calories > 400) descriptions.push("Energy dense");

  if (food.carbs > 30) descriptions.push("Rich in carbs");
  if (food.fat < 5) descriptions.push("Low fat");

  // Add specific benefits
  const lowerName = food.name.toLowerCase();
  if (lowerName.includes("oats") || lowerName.includes("fiber")) descriptions.push("High fiber");
  if (lowerName.includes("nuts")) descriptions.push("Healthy fats");
  if (lowerName.includes("leafy") || lowerName.includes("vegetable")) descriptions.push("Rich in vitamins");

  return descriptions.length > 0 ? descriptions.join(", ") : "Balanced nutrition";
};

// Helper function to get meal foods with goal-based filtering and calorie targeting
const getMealFoods = (allFoods, mealType, goal, dietType, mealTarget, selectedFoods = null) => {
  const mealPlan = buildBalancedMeal(allFoods, mealType, mealTarget, selectedFoods);

  if (mealPlan && mealPlan.foods && mealPlan.foods.length > 0) {
    return mealPlan.foods;
  }

  // fallback to any valid meals
  const fallbackFoods = allFoods
    .filter(food => food.mealType.includes(mealType) && (!selectedFoods || !selectedFoods.has(food.name)))
    .slice(0, 3)
    .map(food => ({ ...food, portion: assignPortion(food), description: getFoodDescription(food) }));

  if (selectedFoods) fallbackFoods.forEach(food => selectedFoods.add(food.name));

  return fallbackFoods;
};

// Function to fetch and cache foods from MongoDB
const getCachedFoods = async () => {
  const now = Date.now();

  // Check if cache is valid
  if (cachedFoods && foodsLastFetched && (now - foodsLastFetched) < CACHE_DURATION) {
    return cachedFoods;
  }

  try {
    // Fetch from MongoDB
    const foodsFromDB = await Food.find();

    console.log("Raw DB count:", foodsFromDB.length);

    // Normalize and filter foods
    const normalizedFoods = foodsFromDB
      .map(foodDoc => {
        // Safe field extraction with fallbacks
        const rawName = (foodDoc.name || foodDoc["Dish Name"] || "").toString().trim();

        // Only skip if name is missing
        if (!rawName) return null;

        // Safe numeric conversions - use Number() for proper parsing
        const calories = Number(foodDoc.calories || foodDoc["Calories (kcal)"] || 0);
        const carbs = Number(foodDoc.carbs || foodDoc["Carbohydrates (g)"] || 0);
        const protein = Number(foodDoc.protein || foodDoc["Protein (g)"] || 0);
        const fat = Number(foodDoc.fat || foodDoc["Fats (g)"] || 0);

        // Determine type (veg/non-veg) based on name - improved detection
        let type;
        if (foodDoc.type) {
          type = foodDoc.type;
        } else {
          const lowerName = rawName.toLowerCase();
          const nonVegKeywords = ["chicken", "fish", "egg", "meat", "pork", "beef", "mutton", "lamb", "prawn", "shrimp", "crab", "lobster", "salmon", "tuna", "turkey", "duck", "goat", "bacon", "sausage", "ham", "salami", "kebab"];
          type = nonVegKeywords.some(keyword => lowerName.includes(keyword)) ? "non-veg" : "veg";
        }

        // Determine meal type - use improved assignment
        let mealType;
        if (Array.isArray(foodDoc.mealType) && foodDoc.mealType.length > 0) {
          mealType = foodDoc.mealType;
        } else {
          mealType = assignMealType(rawName, calories, protein, carbs, fat);
        }

        // Return normalized object
        return {
          name: rawName,
          calories,
          carbs,
          protein,
          fat,
          type,
          mealType
        };
      })
      .filter(food => food !== null); // Remove null entries

    console.log("After mapping count:", normalizedFoods.length);

    // Apply quality filtering to remove junk foods
    const qualityFoods = filterFoods(normalizedFoods);
    console.log("After quality filtering:", qualityFoods.length);

    // Apply additional validity rules
    const validFoods = filterValidFoods(qualityFoods);
    console.log("After valid food filtering:", validFoods.length);

    // Update cache
    cachedFoods = validFoods;
    foodsLastFetched = now;

    // Log meal type distribution for debugging
    const mealTypeCounts = {};
    validFoods.forEach(food => {
      food.mealType.forEach(type => {
        mealTypeCounts[type] = (mealTypeCounts[type] || 0) + 1;
      });
    });
    console.log(`✅ Cached ${validFoods.length} valid foods from MongoDB`);
    console.log(`📊 Meal type distribution:`, mealTypeCounts);

    return validFoods;

  } catch (error) {
    console.error("Error fetching foods from MongoDB:", error);
    // Return cached data if available, otherwise empty array
    return cachedFoods || [];
  }
};

// MAIN CONTROLLER
const generateDietPlan = async (req, res) => {
  try {
    console.log("🔄 Starting diet plan generation...");
    const userInput = req.body;
    console.log("📝 User input:", userInput);

    // 1. Calculate nutrition
    console.log("🥗 Calculating nutrition...");
    const nutrition = calculateNutrition(userInput);
    console.log("✅ Nutrition calculated:", nutrition);

    // 2. Generate diet plan from clean data
    console.log("🍽️ Generating diet plan from cleaned food data...");
    const dietData = await generateDietPlanFromCleanData({
      targetCalories: nutrition.calories,
      dietType: userInput.dietType || 'veg'
    });

    const dietPlan = dietData.meals;
    const mealTotals = dietData.totals;

    console.log("📋 Diet plan generated:");
    Object.entries(dietPlan).forEach(([meal, foods]) => {
      console.log(`  ${meal}: ${foods.length} items`);
      foods.slice(0, 3).forEach(food => {
        console.log(`    - ${food.name} (${food.calories} cal, ${food.protein}g protein)`);
      });
    });

    console.log("✅ Diet plan generated with meal totals");

    // 5. Send response
    console.log("📤 Sending response...");
    res.json({
      success: true,
      nutrition,
      dietPlan,
      mealTotals
    });
    console.log("✅ Response sent successfully");

  } catch (error) {
    console.error("❌ Error generating diet plan:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// New API endpoint per requirements
const generateDietController = async (req, res) => {
  console.log('Received diet generation request');

  try {
    const { age, weight, height, gender, activityLevel, goal, dietType } = req.body;

    // ✅ 1. Validate required fields
    if (!age || !weight || !height || !gender || !activityLevel || !goal || !dietType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: age, weight, height, gender, activityLevel, goal, dietType'
      });
    }

    // ✅ 2. Convert inputs
    const parsedAge = Number(age);
    const parsedWeight = Number(weight);
    const parsedHeight = Number(height);

    if (
      isNaN(parsedAge) || isNaN(parsedWeight) || isNaN(parsedHeight) ||
      parsedAge <= 0 || parsedWeight <= 0 || parsedHeight <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Age, weight, and height must be positive numbers'
      });
    }

    if (parsedAge < 13 || parsedAge > 100) {
      return res.status(400).json({
        success: false,
        error: 'Age must be between 13 and 100 years'
      });
    }

    if (parsedWeight < 30 || parsedWeight > 300) {
      return res.status(400).json({
        success: false,
        error: 'Weight must be between 30 and 300 kg'
      });
    }

    if (parsedHeight < 100 || parsedHeight > 250) {
      return res.status(400).json({
        success: false,
        error: 'Height must be between 100 and 250 cm'
      });
    }

    if (!['male', 'female'].includes(gender)) {
      return res.status(400).json({
        success: false,
        error: 'Gender must be male or female'
      });
    }

    if (!['sedentary', 'moderate', 'active'].includes(activityLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Activity level must be sedentary, moderate, or active'
      });
    }

    if (!['weight_loss', 'maintenance', 'muscle_gain'].includes(goal)) {
      return res.status(400).json({
        success: false,
        error: 'Goal must be weight_loss, maintenance, or muscle_gain'
      });
    }

    if (!['veg', 'non-veg', 'any'].includes(dietType)) {
      return res.status(400).json({
        success: false,
        error: 'Diet type must be veg, non-veg, or any'
      });
    }

    // ✅ 3. Calculate nutrition
    const nutrition = calculateNutrition({
      age: parsedAge,
      weight: parsedWeight,
      height: parsedHeight,
      gender,
      activityLevel,
      goal,
    });

    console.log("STEP 1: Before generateDiet");

    // ✅ 4. Try ML-based diet
    const generatedDiet = await generateDiet({
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    }, dietType, goal);

    console.log("STEP 2: After generateDiet");

    if (
      !generatedDiet ||
      !generatedDiet.meals ||
      Object.values(generatedDiet.meals).every(m => !Array.isArray(m) || m.length === 0)
    ) {
      throw new Error("ML returned empty diet");
    }

    // ✅ 5. Refine + Validate
    const refinedDiet = refineDietPlan(generatedDiet);
    const isValid = validateDietPlan(refinedDiet, nutrition.calories);

    // 🔥 6. If ML fails → use fallback diet
    if (!isValid) {
      console.log("⚠️ ML failed → using fallback diet");

      // 🧯 Fallback (static diet)
      const fallback = getFallbackDiet({
        dietType,
        goal,
        activityLevel,
        targetCalories: nutrition.calories
      });

      return res.json({
        success: true,
        data: {
          ...fallback,
          nutrition,
          source: "fallback"
        }
      });
    }

    // ✅ 7. Return ML diet if valid
    return res.json({
      success: true,
      data: {
        ...refinedDiet,
        nutrition,
        source: "ml",
        metadata: {
          mlApplied: true,
          avgMLScore: refinedDiet.totals?.avgMLScore || 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in generateDietController:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = { generateDietController };