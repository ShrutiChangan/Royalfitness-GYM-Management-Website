const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_PATH = path.join(__dirname, '..', 'indian_food.csv');

const normalizeKey = (str) => (str || '').toString().trim();

const getMealType = (name) => {
  const lowerName = (name || '').toLowerCase();
  if (/\b(cake|halwa|kheer|ice cream|burfi|dessert|sweet)\b/.test(lowerName)) return 'dessert';
  if (/\b(pakora|samosa|cutlet|vada|kebab|pakoda|chips|popcorn|fried)\b/.test(lowerName)) return 'snacks';
  if (/\b(curry|paneer|chicken|fish|dal|sabzi|biryani|pulao|khichdi|sambar|rasam)\b/.test(lowerName)) return 'lunch/dinner';
  if (/\b(tea|coffee|milk|bread|toast|egg|sandwich|pancake|idli|dosa|poha|upma|oats|cereal)\b/.test(lowerName)) return 'breakfast';
  return 'other';
};

const getDietType = (name) => {
  const lowerName = (name || '').toLowerCase();
  
  // Explicitly non-vegetarian
  if (/\b(chicken|mutton|lamb|meat|fish|prawn|shrimp|beef|pork|bacon|ham|sausage|keema)\b/.test(lowerName)) {
    return 'non-veg';
  }
  
  // Explicitly vegetarian/vegan
  if (/\b(paneer|tofu|dal|dhal|lentil|bean|sabzi|vegetable|veg|fruit|nut|seed|grains|rice|wheat|roti|chapati|paratha|naan|puri|poori|bread)\b/.test(lowerName)) {
    return 'veg';
  }
  
  // Eggs are non-veg
  if (/\b(egg|omelette|omelet)\b/.test(lowerName)) {
    return 'non-veg';
  }
  
  // Default to veg if type unclear
  return 'veg';
};

const getCleanFoodData = () => {
  return new Promise((resolve, reject) => {
    const result = [];

    if (!fs.existsSync(CSV_PATH)) {
      return reject(new Error(`CSV file not found at ${CSV_PATH}`));
    }

    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const name = normalizeKey(row['Dish Name'] || row['dish name']);
          const calories = Number(row['Calories (kcal)'] || row['calories'] || 0);
          const carbs = Number(row['Carbohydrates (g)'] || row['carbs'] || 0);
          const protein = Number(row['Protein (g)'] || row['protein'] || 0);
          const fat = Number(row['Fats (g)'] || row['fat'] || 0);

          if (!name) return;
          if ([calories, carbs, protein, fat].some((v) => v === undefined || v === null || Number.isNaN(v))) return;

          let meal_type = getMealType(name);
          if (meal_type === 'dessert') return; // remove dessert items completely

          const diet_type = getDietType(name);

          // Filter out clearly unhealthy items
          if (calories > 800) return; // Too high for a single dish
          if (fat > 75) return; // Way too much fat (likely deep fried)
          if (protein < 1 && calories > 100) return; // Very low protein but decent calories (likely just carbs/sugar/fat)

          const invalidNames = ['powder', 'masala powder', 'paste', 'stock', 'pickle', 'pickled', 'hot cocoa', 'cocoa', 'chocolate milk', 'soda', 'cola'];
          if (invalidNames.some((keyword) => name.toLowerCase().includes(keyword))) return;

          // Don't filter out drinks/juices anymore - they can be breakfast items
          // Don't filter out tea/coffee anymore - they can be breakfast items

          if (meal_type === 'other') {
            // Reassign based on more comprehensive patterns
            if (/\b(rice|roti|chapati|paratha|pulao|biryani|khichdi|idli|dosa|poha|upma|bread|sandwich|pancake|oats|cereal|toast)\b/.test(name.toLowerCase())) {
              meal_type = 'breakfast';
            } else if (/\b(curry|paneer|chicken|fish|dal|sabzi|vegetable|gravy|masala)\b/.test(name.toLowerCase())) {
              meal_type = 'lunch/dinner';
            } else if (/\b(pakora|samosa|cutlet|vada|kebab|pakoda|chips|snack|fruit|nuts|seeds|roasted|fried)\b/.test(name.toLowerCase())) {
              meal_type = 'snacks';
            }
          }

          if (!['breakfast', 'lunch/dinner', 'snacks'].includes(meal_type)) {
            meal_type = 'lunch/dinner'; // Default fallback
          }

          // Create multiple portion sizes for better calorie matching
          const baseFood = {
            name,
            calories,
            carbs,
            protein,
            fat,
            meal_type,
            diet_type,
          };

          const portions = [baseFood];

          // For high-calorie meals, create larger portions
          if (calories > 100 && calories < 400) {
            // Double portion
            portions.push({
              name: `${name} (2 servings)`,
              calories: calories * 2,
              carbs: carbs * 2,
              protein: protein * 2,
              fat: fat * 2,
              meal_type,
              diet_type,
            });

            // Triple portion for main meals
            if (meal_type === 'lunch/dinner' && calories > 150) {
              portions.push({
                name: `${name} (3 servings)`,
                calories: calories * 3,
                carbs: carbs * 3,
                protein: protein * 3,
                fat: fat * 3,
                meal_type,
                diet_type,
              });
            }
          }

          // Add all portions to result
          portions.forEach(food => result.push(food));
        } catch (err) {
          // Skip rows with parsing errors
        }
      })
      .on('end', () => {
        resolve(result);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

module.exports = {
  getCleanFoodData,
};
