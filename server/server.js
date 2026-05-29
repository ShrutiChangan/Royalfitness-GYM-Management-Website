const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

// Middleware
app.use(express.json());

// Import Food model
const Food = require('./models/Food');

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gymdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/members', require('./routes/members'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/subscription-plans', require('./routes/subscriptionPlans'));

// ✅ ADD DIET ROUTE HERE
const dietRoutes = require("./routes/dietRoutes");
app.use("/api/diet", dietRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Gym Management API is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const preferenceRoutes = require("./routes/preferenceRoutes");
app.use("/api/preferences", preferenceRoutes);

const feedbackRoutes = require("./routes/feedbackRoutes");

app.use("/api/feedback", feedbackRoutes);