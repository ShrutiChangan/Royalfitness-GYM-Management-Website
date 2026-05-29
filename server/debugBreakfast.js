const { getCleanFoodData } = require('./utils/dataProcessor');
const { generateDietPlanFromCleanData } = require('./utils/dietGenerator');

(async () => {
  try {
    console.log('Loading food data...');
    const foods = await getCleanFoodData();
    console.log('Total foods:', foods.length);
    
    // Check breakfast veg candidates
    const breakfastVeg = foods.filter(f => f.meal_type === 'breakfast' && f.diet_type === 'veg');
    console.log('\nBreakfast VEG items:', breakfastVeg.length);
    console.log('First 30:');
    breakfastVeg.slice(0, 30).forEach(f => {
      console.log(`  ${f.name}: ${f.calories}cal, ${f.protein}g P, ${f.fat}g F, ${f.diet_type}`);
    });
    
    // Now check what diet generator returns
    console.log('\n=== Generating diet for 25yo, 70kg, 175cm, male, moderate, maintenance, veg ===');
    const diet = await generateDietPlanFromCleanData({
      targetCalories: 2594,
      dietType: 'veg'
    });
    
    console.log('\nDiet breakfast:', diet.meals.breakfast.length, 'items');
    if (diet.meals.breakfast.length === 0) {
      console.log('ERROR: No breakfast items generated!');
      console.log('Checking candidates...');
      
      // Manually trace through the logic
      const usedNames = new Set();
      const mealTargets = {
        breakfast: Math.round(2594 * 0.25),
        lunch: Math.round(2594 * 0.35),
        dinner: Math.round(2594 * 0.30),
        snacks: Math.round(2594 * 0.10),
      };
      
      console.log('Breakfast target:', mealTargets.breakfast, 'cal');
      
      const MEAL_TYPE_MAP = {
        breakfast: "breakfast",
        lunch: "lunch/dinner",
        dinner: "lunch/dinner",
        snacks: "snacks",
      };
      
      const candidates = foods
        .filter(f => f.meal_type === MEAL_TYPE_MAP['breakfast'])
        .filter(f => 'veg' === "any" || f.diet_type === 'veg')
        .filter(f => !usedNames.has(f.name));
      
      console.log('Breakfast candidates:', candidates.length);
      console.log('First 10 candidates:');
      candidates.slice(0, 10).forEach(f => {
        console.log(`  ${f.name}: ${f.calories}cal, ${f.protein}g P, fat: ${f.fat}g`);
      });
    } else {
      console.log('Breakfast items:');
      diet.meals.breakfast.forEach(f => {
        console.log(`  ${f.name}: ${f.calories}cal, ${f.protein}g P`);
      });
    }
    
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();
