const OpenAI = require("openai");
const UserPreference = require("../models/UserPreference");
const Feedback = require("../models/Feedback");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateAIDiet = async (userData) => {
  const {
    age,
    weight,
    height,
    gender,
    activityLevel,
    goal,
    dietType,
    userId
  } = userData;

  let likedFoods = [];
  let dislikedFoods = [];

  // ✅ STEP 1: Try user-specific preferences
  if (userId) {
    const prefs = await UserPreference.findOne({ userId });

    if (prefs) {
      likedFoods = prefs.likedFoods || [];
      dislikedFoods = prefs.dislikedFoods || [];
    }
  }

  // ✅ STEP 2: Fallback to global feedback (if no user prefs)
  if (likedFoods.length === 0 && dislikedFoods.length === 0) {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(20);

    feedbacks.forEach(f => {
      if (f.feedback === "like") {
        likedFoods.push(...f.foods.map(food => food.name));
      } else {
        dislikedFoods.push(...f.foods.map(food => food.name));
      }
    });
  }

  // Limit size (important for prompt quality)
  likedFoods = likedFoods.slice(0, 10);
  dislikedFoods = dislikedFoods.slice(0, 10);

  // ✅ STEP 3: Build prompt
  const prompt = `
Create a personalized Indian diet plan.

User details:
- Age: ${age}
- Weight: ${weight} kg
- Height: ${height} cm
- Gender: ${gender}
- Activity Level: ${activityLevel}
- Goal: ${goal}
- Diet Type: ${dietType}

User preferences:
- Likes: ${likedFoods.length ? likedFoods.join(", ") : "None"}
- Dislikes: ${dislikedFoods.length ? dislikedFoods.join(", ") : "None"}

Rules:
- Include liked foods when possible
- STRICTLY avoid disliked foods
- Only Indian foods
- 4 meals: breakfast, lunch, dinner, snacks
- 2-3 items per meal
- Include realistic portion sizes (e.g., 2 roti, 1 bowl rice)

Return ONLY valid JSON:
{
  "breakfast": [{ "name": "", "portion": "" }],
  "lunch": [{ "name": "", "portion": "" }],
  "dinner": [{ "name": "", "portion": "" }],
  "snacks": [{ "name": "", "portion": "" }]
}
`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional Indian dietitian." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    let text = response.choices[0].message.content;

    // ✅ STEP 4: Clean response
    const cleaned = text.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(cleaned);
    } catch (parseError) {
      console.error("❌ JSON Parse Failed:", cleaned);

      // fallback safe structure
      return {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      };
    }

  } catch (err) {
    console.error("❌ OpenAI Error:", err);

    // Hard fallback
    return {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };
  }
};

module.exports = { generateAIDiet };