const mongoose = require("mongoose");
const csv = require("csvtojson");
const Food = require("./models/Food");
require("dotenv").config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gymdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Import foods from CSV
async function importFoods() {
  try {
    console.log('📂 Reading indian_food.csv...');

    // Read CSV file
    const csvData = await csv().fromFile("indian_food.csv");

    console.log(`📊 Found ${csvData.length} rows in CSV`);

    let insertedCount = 0;
    let skippedCount = 0;

    // Process each row
    for (const row of csvData) {
      try {
        // Map CSV columns to our schema
        const foodData = {
          name: row["Dish Name"]?.trim() || "Unknown",
          calories: Number(row["Calories (kcal)"]) || 0,
          carbs: Number(row["Carbohydrates (g)"]) || 0,
          protein: Number(row["Protein (g)"]) || 0,
          fat: Number(row["Fats (g)"]) || 0,
        };

        // Debug: log first few mappings
        if (insertedCount < 3) {
          console.log(`🔍 Mapping row: "${row["Dish Name"]}" -> name: "${foodData.name}", calories: ${foodData.calories}`);
        }

        // Skip if name is missing or invalid
        if (!foodData.name || foodData.name === "Unknown") {
          console.log(`⚠️ Skipping row with invalid name:`, row["Dish Name"]);
          continue;
        }

        // Check if food already exists
        const existingFood = await Food.findOne({ name: foodData.name });

        if (existingFood) {
          skippedCount++;
          continue; // Skip duplicates
        }

        // Create new food document with ONLY the mapped fields
        const newFood = new Food({
          name: foodData.name,
          calories: foodData.calories,
          carbs: foodData.carbs,
          protein: foodData.protein,
          fat: foodData.fat
        });

        await newFood.save();

        insertedCount++;

        // Log progress every 100 items
        if (insertedCount % 100 === 0) {
          console.log(`📝 Inserted ${insertedCount} foods so far...`);
        }

      } catch (rowError) {
        console.error(`❌ Error processing row:`, row, rowError.message);
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`✅ Inserted: ${insertedCount} foods`);
    console.log(`⏭️ Skipped (duplicates): ${skippedCount} foods`);
    console.log(`📊 Total processed: ${insertedCount + skippedCount} foods`);

  } catch (error) {
    console.error('❌ Error importing foods:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the import
async function main() {
  await connectDB();
  await importFoods();
  process.exit(0);
}

main().catch(console.error);