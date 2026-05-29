const { getCleanFoodData } = require('./utils/dataProcessor');

(async () => {
  try {
    const foods = await getCleanFoodData();
    
    console.log('=== BREAKFAST VEGAN ITEMS ===');
    const breakfastVeg = foods.filter(f => f.meal_type === 'breakfast' && f.diet_type === 'veg');
    console.log(`Total breakfast veg items: ${breakfastVeg.length}`);
    console.log('Sample items:');
    breakfastVeg.slice(0, 20).forEach(f => {
      console.log(`  - ${f.name}: ${f.calories}cal, ${f.protein}g P`);
    });
    
    console.log('\n=== BREAKFAST NON-VEG ITEMS ===');
    const breakfastNonVeg = foods.filter(f => f.meal_type === 'breakfast' && f.diet_type === 'non-veg');
    console.log(`Total breakfast non-veg items: ${breakfastNonVeg.length}`);
    console.log('Sample items:');
    breakfastNonVeg.slice(0, 20).forEach(f => {
      console.log(`  - ${f.name}: ${f.calories}cal, ${f.protein}g P`);
    });
    
    console.log('\n=== SNACKS VEGAN ITEMS ===');
    const snacksVeg = foods.filter(f => f.meal_type === 'snacks' && f.diet_type === 'veg');
    console.log(`Total snacks veg items: ${snacksVeg.length}`);
    console.log('All items:');
    snacksVeg.forEach(f => {
      console.log(`  - ${f.name}: ${f.calories}cal, ${f.protein}g P, ${f.fat}g F`);
    });
    
    console.log('\n=== LUNCH/DINNER VEG ITEMS ===');
    const lunchVeg = foods.filter(f => f.meal_type === 'lunch/dinner' && f.diet_type === 'veg');
    console.log(`Total lunch/dinner veg items: ${lunchVeg.length}`);
    console.log('Sample items:');
    lunchVeg.slice(0, 30).forEach(f => {
      console.log(`  - ${f.name}: ${f.calories}cal, ${f.protein}g P`);
    });
    
    console.log('\n=== FOOD STATS ===');
    const stats = foods.reduce((acc, f) => {
      acc.highFat = acc.highFat + (f.fat > 50 ? 1 : 0);
      acc.lowProtein = acc.lowProtein + (f.protein < 2 ? 1 : 0);
      acc.highCal = acc.highCal + (f.calories > 400 ? 1 : 0);
      return acc;
    }, { highFat: 0, lowProtein: 0, highCal: 0 });
    
    console.log(`Items with > 50g fat: ${stats.highFat}`);
    console.log(`Items with < 2g protein: ${stats.lowProtein}`);
    console.log(`Items with > 400cal: ${stats.highCal}`);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
