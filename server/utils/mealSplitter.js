function splitMeals({ calories, protein, carbs, fat }) {
  // Updated calorie distribution for better meal structure
  const split = {
    breakfast: 0.225, // 22.5% (midpoint of 20-25%)
    lunch: 0.375,     // 37.5% (midpoint of 35-40%)
    dinner: 0.275,    // 27.5% (midpoint of 25-30%)
    snacks: 0.125,    // 12.5% (midpoint of 10-15%)
  };

  const meals = {};

  for (let meal in split) {
    meals[meal] = {
      calories: Math.round(calories * split[meal]),
      protein: Math.round(protein * split[meal]),
      carbs: Math.round(carbs * split[meal]),
      fat: Math.round(fat * split[meal]),
    };
  }

  return meals;
}

module.exports = { splitMeals };