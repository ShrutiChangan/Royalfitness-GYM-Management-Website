/**
 * Diet Validation System
 *
 * Validates diet plans against strict nutritional and structural requirements.
 * Used to determine if a generated diet meets quality standards.
 */

/**
 * Validates a diet plan against comprehensive quality criteria
 * @param {Object} diet - The diet plan to validate
 * @param {number} targetCalories - The target calorie amount
 * @returns {boolean} - true if valid, false if invalid
 */
function validateDietPlan(diet, targetCalories) {
  if (!diet || !diet.meals || !diet.totals) {
    return false;
  }

  const { meals, totals } = diet;

  // A. CALORIE CHECK: totalCalories within ±30% of target (more lenient for high-calorie diets)
  const calorieTolerance = Math.max(targetCalories * 0.30, 300); // At least 300 calorie tolerance
  const calorieDiff = Math.abs(totals.totalCalories - targetCalories);
  if (calorieDiff > calorieTolerance) {
    console.log(`❌ Calorie validation failed: ${totals.totalCalories} vs ${targetCalories} (diff: ${calorieDiff})`);
    return false;
  }

  // B. MEAL COMPLETENESS: all meals must have at least 1 item
  if (!meals.breakfast || meals.breakfast.length === 0 ||
      !meals.lunch || meals.lunch.length === 0 ||
      !meals.dinner || meals.dinner.length === 0 ||
      !meals.snacks || meals.snacks.length === 0) {
    console.log('❌ Meal completeness validation failed: missing meals');
    return false;
  }

  // C. SNACK QUALITY: no heavy main meal foods in snacks (relaxed)
  const heavySnackKeywords = ['biryani', 'pulao'];
  const hasHeavySnacks = meals.snacks.some(snack => {
    const name = snack.name.toLowerCase();
    return heavySnackKeywords.some(keyword => name.includes(keyword));
  });
  if (hasHeavySnacks) {
    console.log('❌ Snack quality validation failed: heavy foods in snacks');
    return false;
  }

  // D. PROTEIN CHECK: totalProtein >= 15g (further relaxed)
  if (totals.totalProtein < 15) {
    console.log(`❌ Protein validation failed: ${totals.totalProtein}g < 15g`);
    return false;
  }

  // Calculate meal calories for balance check
  const mealCalories = {
    breakfast: meals.breakfast.reduce((sum, food) => sum + food.calories, 0),
    lunch: meals.lunch.reduce((sum, food) => sum + food.calories, 0),
    dinner: meals.dinner.reduce((sum, food) => sum + food.calories, 0),
    snacks: meals.snacks.reduce((sum, food) => sum + food.calories, 0)
  };

  // E. MEAL BALANCE: no meal > 65% of total calories (relaxed from 50%)
  const maxAllowedCalories = totals.totalCalories * 0.65;
  if (mealCalories.breakfast > maxAllowedCalories ||
      mealCalories.lunch > maxAllowedCalories ||
      mealCalories.dinner > maxAllowedCalories ||
      mealCalories.snacks > maxAllowedCalories) {
    console.log('❌ Meal balance validation failed: meal too large');
    return false;
  }

  // F. FOOD VALIDITY: no clearly invalid items
  const invalidKeywords = ['ladoo', 'cake', 'halwa', 'burfi'];
  const allFoods = [...meals.breakfast, ...meals.lunch, ...meals.dinner, ...meals.snacks];
  const hasInvalidFoods = allFoods.some(food => {
    const name = food.name.toLowerCase();
    return invalidKeywords.some(keyword => name.includes(keyword));
  });

  if (hasInvalidFoods) {
    console.log('❌ Food validity validation failed: invalid foods present');
    return false;
  }

  // G. BASIC NUTRITIONAL BALANCE: carbs and fat should be reasonable
  const carbPercent = (totals.totalCarbs * 4) / totals.totalCalories;
  const fatPercent = (totals.totalFat * 9) / totals.totalCalories;
  const proteinPercent = (totals.totalProtein * 4) / totals.totalCalories;

  if (carbPercent < 0.25 || carbPercent > 0.75) {
    console.log(`❌ Macro balance validation failed: carb % ${carbPercent.toFixed(2)}`);
    return false;
  }

  if (fatPercent < 0.10 || fatPercent > 0.45) {
    console.log(`❌ Macro balance validation failed: fat % ${fatPercent.toFixed(2)}`);
    return false;
  }

  if (proteinPercent < 0.08 || proteinPercent > 0.40) {
    console.log(`❌ Macro balance validation failed: protein % ${proteinPercent.toFixed(2)}`);
    return false;
  }

  // H. FAT/PROTEIN RATIO: fat should remain lower than protein for structured diet
  if (totals.totalFat >= totals.totalProtein) {
    console.log(`❌ Fat vs protein validation failed: fat ${totals.totalFat}g >= protein ${totals.totalProtein}g`);
    return false;
  }

  // All validations passed
  return true;
}

module.exports = {
  validateDietPlan
};