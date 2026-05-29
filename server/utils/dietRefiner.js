/**
 * Diet Refinement and Realism Validation Module
 *
 * This module refines generated diet plans by enforcing realistic, healthy,
 * and structured meal rules to ensure better nutrition and practicality.
 */

const VALID_SNACKS = [
  // Fruits
  "apple", "banana", "orange", "grapes", "mango", "pineapple", "papaya",
  "guava", "pear", "peach", "plum", "strawberry", "blueberry", "kiwi",
  // Nuts and seeds
  "almonds", "walnuts", "cashews", "peanuts", "pistachios", "raisins",
  "dates", "figs", "coconut", "chia seeds", "flax seeds",
  // Light items
  "boiled egg", "yogurt", "cucumber", "carrot", "tomato", "lettuce",
  "fruit salad", "mixed nuts", "protein shake", "green tea", "herbal tea",
  // Dairy light
  "milk", "buttermilk", "cottage cheese"
];

const BREAKFAST_ALLOWED_KEYWORDS = [
  "dosa", "idli", "bread", "toast", "sandwich", "egg", "milk", "tea",
  "coffee", "cereal", "oats", "poha", "upma", "pancake", "paratha",
  "roti", "chapati", "juice", "fruit", "yogurt", "cheese", "besan", "chilla", "shake", "smoothie"
];

const INVALID_FOOD_KEYWORDS = [
  "ladoo", "halwa", "cake", "ice cream", "pastry", "sweet", "candy",
  "jelly", "pudding", "syrup", "chocolate", "cookies", "biscuit",
  "infant", "baby", "khoa", "burfi", "kheer", "rasgulla", "gulab jamun"
];

const PROTEIN_SOURCES = [
  "paneer", "dal", "chicken", "egg", "fish", "meat", "mutton", "beef",
  "tofu", "soy", "lentil", "bean", "gram", "chickpea", "kidney bean",
  "cheese", "yogurt", "milk", "nuts", "seeds"
];

const CARB_SOURCES = [
  "rice", "roti", "chapati", "bread", "poha", "upma", "dosa", "idli",
  "pasta", "noodle", "potato", "sweet potato", "wheat", "flour",
  "cereal", "oats", "corn", "maize"
];

/**
 * Refines a diet plan by applying realistic and healthy meal rules
 * @param {Object} diet - The diet plan to refine
 * @returns {Object} - The refined diet plan
 */
function refineDietPlan(diet) {
  if (!diet || !diet.meals) {
    throw new Error('Invalid diet plan provided');
  }

  const refinedMeals = {
    breakfast: [...diet.meals.breakfast],
    lunch: [...diet.meals.lunch],
    dinner: [...diet.meals.dinner],
    snacks: [...diet.meals.snacks]
  };

  // Step 1: Remove invalid foods globally
  removeInvalidFoods(refinedMeals);

  // Step 2: Apply snacks rule
  refineSnacks(refinedMeals);

  // Step 3: Apply breakfast rule
  refineBreakfast(refinedMeals);

  // Step 4: Apply lunch/dinner rule
  refineLunchDinner(refinedMeals);

  // Step 5: Remove duplicates across meals
  removeDuplicates(refinedMeals);

  // Step 6: Recalculate totals
  const refinedTotals = calculateTotals(refinedMeals);

  return {
    meals: refinedMeals,
    totals: refinedTotals,
    mealTargets: diet.mealTargets || {}
  };
}

/**
 * Removes foods containing invalid keywords
 */
function removeInvalidFoods(meals) {
  Object.keys(meals).forEach(mealType => {
    meals[mealType] = meals[mealType].filter(food => {
      const name = food.name.toLowerCase();
      return !INVALID_FOOD_KEYWORDS.some(keyword => name.includes(keyword));
    });
  });
}

/**
 * Refines snacks to only include healthy, light items
 */
function refineSnacks(meals) {
  const validSnacks = meals.snacks.filter(food => {
    const name = food.name.toLowerCase();
    return VALID_SNACKS.some(validSnack =>
      name.includes(validSnack.toLowerCase()) ||
      validSnack.toLowerCase().includes(name)
    );
  });

  // If we have fewer than 2 valid snacks, add healthy alternatives
  const healthyAlternatives = [
    { name: "Apple", calories: 52, carbs: 14, protein: 0.3, fat: 0.2, meal_type: "snacks", diet_type: "veg" },
    { name: "Banana", calories: 89, carbs: 23, protein: 1.1, fat: 0.3, meal_type: "snacks", diet_type: "veg" },
    { name: "Almonds (10 pieces)", calories: 69, carbs: 2.3, protein: 2.4, fat: 6.1, meal_type: "snacks", diet_type: "veg" },
    { name: "Boiled Egg", calories: 68, carbs: 0.6, protein: 5.7, fat: 4.5, meal_type: "snacks", diet_type: "non-veg" },
    { name: "Greek Yogurt", calories: 59, carbs: 3.6, protein: 10, fat: 0.4, meal_type: "snacks", diet_type: "veg" },
    { name: "Mixed Nuts (small handful)", calories: 170, carbs: 6, protein: 5, fat: 15, meal_type: "snacks", diet_type: "veg" },
    { name: "Orange", calories: 47, carbs: 12, protein: 0.9, fat: 0.1, meal_type: "snacks", diet_type: "veg" },
    { name: "Carrot sticks", calories: 30, carbs: 7, protein: 0.7, fat: 0.1, meal_type: "snacks", diet_type: "veg" }
  ];

  // Replace invalid snacks with healthy alternatives
  const targetSnackCount = Math.max(2, meals.snacks.length); // Keep at least 2 snacks

  while (validSnacks.length < targetSnackCount) {
    // Find an alternative that hasn't been used yet
    const availableAlternatives = healthyAlternatives.filter(alt =>
      !validSnacks.some(existing =>
        existing.name.toLowerCase().includes(alt.name.toLowerCase().split(' ')[0])
      )
    );

    if (availableAlternatives.length > 0) {
      validSnacks.push({ ...availableAlternatives[0], mlScore: 0.5 });
    } else {
      break; // No more alternatives available
    }
  }

  meals.snacks = validSnacks.slice(0, Math.min(3, targetSnackCount)); // Limit to 3 snacks max
}

/**
 * Refines breakfast to only include light, appropriate items
 */
function refineBreakfast(meals) {
  meals.breakfast = meals.breakfast.filter(food => {
    const name = food.name.toLowerCase();
    const avoid = /iced tea|iced coffee|soda|cola|soft drink|hot cocoa|cocoa|milk shake|smoothie/;
    const isAllowed = BREAKFAST_ALLOWED_KEYWORDS.some(keyword => name.includes(keyword));
    return isAllowed && !avoid.test(name);
  });

  // If no breakfast items remain, add a realistic Indian option
  if (meals.breakfast.length === 0) {
    meals.breakfast = [
      {
        name: "Besan Chilla",
        calories: 220,
        carbs: 25,
        protein: 12,
        fat: 9,
        meal_type: "breakfast",
        diet_type: "veg",
        mlScore: 0.8
      },
      {
        name: "Idli with Sambar",
        calories: 170,
        carbs: 30,
        protein: 6,
        fat: 2,
        meal_type: "breakfast",
        diet_type: "veg",
        mlScore: 0.8
      }
    ];
  }
}

/**
 * Ensures lunch and dinner have both protein and carb sources
 */
function refineLunchDinner(meals) {
  ['lunch', 'dinner'].forEach(mealType => {
    let mealFoods = meals[mealType] || [];

    // Remove sugary / beverage-like items for main meals (e.g., hot cocoa)
    mealFoods = mealFoods.filter(food => {
      const name = food.name.toLowerCase();
      if (/hot cocoa|cocoa|milk shake|smoothie|soft drink|cola|soda|ice cream/.test(name)) {
        return false;
      }
      // Avoid buttermilk/raita in dinner (prefer lunch)
      if (mealType === 'dinner' && /raita|buttermilk/.test(name)) {
        return false;
      }
      return true;
    });

    // Ensure there is at least one carb and one vegetable component for a balanced large meal
    const hasProtein = mealFoods.some(food => {
      const name = food.name.toLowerCase();
      return PROTEIN_SOURCES.some(protein => name.includes(protein));
    });

    const hasCarb = mealFoods.some(food => {
      const name = food.name.toLowerCase();
      return CARB_SOURCES.some(carb => name.includes(carb));
    });

    const hasVegetable = mealFoods.some(food => {
      const name = food.name.toLowerCase();
      return /\b(vegetable|sabzi|sabji|curry|greens|salad|bhaji|spinach|cauliflower|broccoli|carrot|peas|mushroom)\b/.test(name);
    });

    const hasVegetableOrCurry = hasVegetable;

    // If chapati/rice exists in meal without vegetable/curry, enforce pairing by replacement policy
    if (!hasVegetableOrCurry) {
      mealFoods = mealFoods.map(food => {
        const name = food.name.toLowerCase();

        if (name.includes('chapati')) {
          return {
            ...food,
            name: 'Paratha',
            calories: food.calories || 210,
            carbs: food.carbs || 32,
            protein: food.protein || 5,
            fat: food.fat || 7
          };
        }

        if (name.includes('rice')) {
          return {
            ...food,
            name: 'Rice (with vegetable)',
            calories: food.calories || 210,
            carbs: food.carbs || 45,
            protein: food.protein || 4,
            fat: food.fat || 1.5
          };
        }

        return food;
      });
    }

    const hasSalad = mealFoods.some(food => food.name.toLowerCase().includes('salad'));

    // Add a healthy salad / structured meal component when missing (if not duplicate)
    const extras = [];

    if (!hasSalad) {
      extras.push({ name: 'Fresh Salad', calories: 40, carbs: 8, protein: 1.5, fat: 0.3, meal_type: mealType, diet_type: 'veg', mlScore: 0.7 });
    }

    // Prefer curd/raita/buttermilk for lunch only
    if (mealType === 'lunch') {
      if (!mealFoods.some(food => food.name.toLowerCase().includes('curd'))) {
        extras.push({ name: 'Curd / Yogurt (100g)', calories: 62, carbs: 4.7, protein: 3.5, fat: 3.3, meal_type: mealType, diet_type: 'veg', mlScore: 0.7 });
      }

      if (!mealFoods.some(food => food.name.toLowerCase().includes('buttermilk'))) {
        extras.push({ name: 'Buttermilk (200ml)', calories: 60, carbs: 8, protein: 3, fat: 1.5, meal_type: mealType, diet_type: 'veg', mlScore: 0.7 });
      }

      if (!mealFoods.some(food => food.name.toLowerCase().includes('raita'))) {
        extras.push({ name: 'Raita (100g)', calories: 70, carbs: 5, protein: 3, fat: 3, meal_type: mealType, diet_type: 'veg', mlScore: 0.7 });
      }
    }

    // Prefer low fat option for protein when needed
    if (mealFoods.reduce((sum, f) => sum + f.fat, 0) >= mealFoods.reduce((sum, f) => sum + f.protein, 0)) {
      const leanProtein = mealFoods.filter(food => /\b(dal|beans|tofu|paneer|chicken|fish|egg)\b/.test(food.name.toLowerCase()));
      if (leanProtein.length > 0) {
        // reduce high-fat sources if list is heavy on fat
        mealFoods = mealFoods.filter(food => !/\b(cheese|cream|ghee|butter|fried|kebab|samosa)\b/.test(food.name.toLowerCase()) || /\b(dal|beans|tofu|paneer|chicken|fish|egg)\b/.test(food.name.toLowerCase()));
      }
    }

    // Ensure enough structure for lunch/dinner
    if (mealType === 'lunch') {
      if (!hasCarb) {
        mealFoods.push({ name: 'Steamed Rice / Chapati', calories: 160, carbs: 35, protein: 3, fat: 1.1, meal_type: 'lunch', diet_type: 'veg', mlScore: 0.8 });
      }
      if (!hasVegetable) {
        mealFoods.push({ name: 'Mixed Vegetable Sabzi', calories: 95, carbs: 12, protein: 4, fat: 3.5, meal_type: 'lunch', diet_type: 'veg', mlScore: 0.8 });
      }
      if (!hasProtein) {
        mealFoods.push({ name: 'Dal / Green Moong', calories: 95, carbs: 15, protein: 8, fat: 2, meal_type: 'lunch', diet_type: 'veg', mlScore: 0.8 });
      }
    }

    if (mealType === 'dinner') {
      if (!hasCarb) {
        mealFoods.push({ name: 'Chapati / Rice', calories: 150, carbs: 32, protein: 3, fat: 1, meal_type: 'dinner', diet_type: 'veg', mlScore: 0.8 });
      }
      if (!hasVegetable) {
        mealFoods.push({ name: 'Salad / Mixed Veg', calories: 50, carbs: 10, protein: 2, fat: 0.5, meal_type: 'dinner', diet_type: 'veg', mlScore: 0.8 });
      }
      if (!hasProtein) {
        mealFoods.push({ name: 'Light Paneer / Dal', calories: 110, carbs: 7, protein: 9, fat: 5, meal_type: 'dinner', diet_type: 'veg', mlScore: 0.8 });
      }
    }

    meals[mealType] = [...mealFoods, ...extras].slice(0, 5);
  });
}


/**
 * Removes duplicate foods across different meals
 */
function removeDuplicates(meals) {
  const usedFoods = new Set();

  // Process meals in order of priority (keep breakfast, then lunch, then dinner, then snacks)
  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snacks'];

  mealOrder.forEach(mealType => {
    meals[mealType] = meals[mealType].filter(food => {
      const foodKey = food.name.toLowerCase();
      if (usedFoods.has(foodKey)) {
        return false; // Remove duplicate
      }
      usedFoods.add(foodKey);
      return true;
    });
  });
}

/**
 * Recalculates total nutrition values based on refined meals
 */
function calculateTotals(meals) {
  const totals = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalMLScore: 0,
    foodCount: 0
  };

  Object.values(meals).forEach(mealList => {
    mealList.forEach(item => {
      totals.totalCalories += item.calories || 0;
      totals.totalProtein += item.protein || 0;
      totals.totalCarbs += item.carbs || 0;
      totals.totalFat += item.fat || 0;
      totals.totalMLScore += item.mlScore || 0;
      totals.foodCount += 1;
    });
  });

  totals.avgMLScore = totals.foodCount > 0 ? totals.totalMLScore / totals.foodCount : 0;

  // Normalize to one decimal precision
  totals.totalCalories = Number(totals.totalCalories.toFixed(1));
  totals.totalProtein = Number(totals.totalProtein.toFixed(1));
  totals.totalCarbs = Number(totals.totalCarbs.toFixed(1));
  totals.totalFat = Number(totals.totalFat.toFixed(1));
  totals.avgMLScore = Number(totals.avgMLScore.toFixed(2));

  return totals;
}

module.exports = {
  refineDietPlan,
  VALID_SNACKS,
  BREAKFAST_ALLOWED_KEYWORDS,
  INVALID_FOOD_KEYWORDS,
  PROTEIN_SOURCES,
  CARB_SOURCES
};