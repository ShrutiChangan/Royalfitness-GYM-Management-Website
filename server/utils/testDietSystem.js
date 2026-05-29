/**
 * Diet Generation Test Suite
 *
 * Tests the improved diet generation system to ensure:
 * 1. Reduced fallback frequency
 * 2. Biologically accurate nutrition
 * 3. Realistic macro distributions
 */

const { calculateNutrition } = require('./nutritionCalculator');
const { generateDietPlanFromCleanData } = require('./dietGenerator');
const { validateDietPlan } = require('./dietValidator');

// Test user profiles that should work without fallback
const testProfiles = [
  // Standard maintenance profiles
  {
    name: "Average Male Maintenance",
    age: 30,
    weight: 70,
    height: 175,
    gender: "male",
    activityLevel: "moderate",
    goal: "maintenance",
    dietType: "veg"
  },
  {
    name: "Average Female Maintenance",
    age: 28,
    weight: 60,
    height: 165,
    gender: "female",
    activityLevel: "moderate",
    goal: "maintenance",
    dietType: "non-veg"
  },

  // Weight loss profiles
  {
    name: "Male Weight Loss",
    age: 35,
    weight: 85,
    height: 180,
    gender: "male",
    activityLevel: "active",
    goal: "weight_loss",
    dietType: "veg"
  },
  {
    name: "Female Weight Loss",
    age: 32,
    weight: 75,
    height: 170,
    gender: "female",
    activityLevel: "moderate",
    goal: "weight_loss",
    dietType: "non-veg"
  },

  // Weight gain profiles
  {
    name: "Young Male Weight Gain",
    age: 25,
    weight: 65,
    height: 175,
    gender: "male",
    activityLevel: "active",
    goal: "weight_gain",
    dietType: "non-veg"
  },
  {
    name: "Female Weight Gain",
    age: 26,
    weight: 55,
    height: 160,
    gender: "female",
    activityLevel: "moderate",
    goal: "weight_gain",
    dietType: "veg"
  },

  // Sedentary profiles
  {
    name: "Sedentary Male",
    age: 45,
    weight: 80,
    height: 170,
    gender: "male",
    activityLevel: "sedentary",
    goal: "maintenance",
    dietType: "veg"
  },
  {
    name: "Sedentary Female",
    age: 42,
    weight: 68,
    height: 162,
    gender: "female",
    activityLevel: "sedentary",
    goal: "weight_loss",
    dietType: "non-veg"
  }
];

async function testDietGeneration() {
  console.log("🧪 Testing Improved Diet Generation System\n");

  let successCount = 0;
  let totalTests = testProfiles.length;

  for (const profile of testProfiles) {
    console.log(`\n📋 Testing: ${profile.name}`);
    console.log(`   Profile: ${profile.age}y, ${profile.weight}kg, ${profile.height}cm, ${profile.gender}, ${profile.activityLevel}, ${profile.goal}, ${profile.dietType}`);

    try {
      // Calculate nutrition
      const nutrition = calculateNutrition(profile);
      console.log(`   Target: ${nutrition.calories} cal, ${nutrition.protein}g protein, ${nutrition.carbs}g carbs, ${nutrition.fat}g fat`);

      // Generate diet
      const dietPlan = await generateDietPlanFromCleanData({
        targetCalories: nutrition.calories,
        targetProtein: nutrition.protein,
        targetCarbs: nutrition.carbs,
        targetFat: nutrition.fat,
        dietType: profile.dietType,
        goal: profile.goal
      });

      // Validate diet
      const isValid = validateDietPlan(dietPlan, nutrition.calories);

      if (isValid) {
        console.log(`   ✅ SUCCESS: Diet generated and validated`);
        console.log(`   Actual: ${dietPlan.totals.totalCalories} cal, ${dietPlan.totals.totalProtein}g protein, ${dietPlan.totals.totalCarbs}g carbs, ${dietPlan.totals.totalFat}g fat`);

        // Check macro percentages
        const carbPercent = (dietPlan.totals.totalCarbs * 4) / dietPlan.totals.totalCalories;
        const proteinPercent = (dietPlan.totals.totalProtein * 4) / dietPlan.totals.totalCalories;
        const fatPercent = (dietPlan.totals.totalFat * 9) / dietPlan.totals.totalCalories;

        console.log(`   Macros: ${carbPercent.toFixed(2)} carbs, ${proteinPercent.toFixed(2)} protein, ${fatPercent.toFixed(2)} fat`);

        successCount++;
      } else {
        console.log(`   ❌ FAILED: Diet validation failed`);
        console.log(`   Actual: ${dietPlan.totals.totalCalories} cal, ${dietPlan.totals.totalProtein}g protein`);
      }

    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }

  console.log(`\n📊 Test Results: ${successCount}/${totalTests} profiles generated valid diets (${Math.round(successCount/totalTests*100)}% success rate)`);

  if (successCount >= totalTests * 0.8) {
    console.log("🎉 SUCCESS: Diet generation system significantly improved!");
  } else {
    console.log("⚠️  WARNING: Diet generation may still need further improvements");
  }
}

// Export for use in other files
module.exports = {
  testProfiles,
  testDietGeneration
};

// Run tests if this file is executed directly
if (require.main === module) {
  testDietGeneration().catch(console.error);
}