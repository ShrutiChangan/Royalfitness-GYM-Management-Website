const csv = require("csvtojson");
const fs = require("fs");

csv()
  .fromFile("indian_food.csv")
  .then((data) => {

    const formatted = data.map((item) => {
      return {
        name: item.name || "Unknown",

        calories: Number(item.calories) || 100,
        protein: Number(item.protein) || 5,
        carbs: Number(item.carbohydrates) || 20,
        fat: Number(item.fat) || 5,

        type: item.veg === "yes" ? "veg" : "non-veg",

        mealType: assignMealType(item.name),
      };
    });

    fs.writeFileSync("foods.json", JSON.stringify(formatted, null, 2));
    console.log("✅ foods.json created successfully");
  });

function assignMealType(name) {
  name = name ? name.toLowerCase() : "";

  if (name.includes("poha") || name.includes("idli") || name.includes("upma") || name.includes("tea")) {
    return ["breakfast"];
  }

  if (name.includes("rice") || name.includes("dal") || name.includes("roti") || name.includes("paneer")) {
    return ["lunch", "dinner"];
  }

  return ["snacks"];
}