const express = require('express');
const router = express.Router();
const SubscriptionPlan = require('../models/SubscriptionPlan');

// GET all subscription plans
router.get('/', async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ active: true }).sort({ price: 1 });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single subscription plan
router.get('/:id', async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
    res.json(plan);
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create new subscription plan
router.post('/', async (req, res) => {
  try {
    const { name, price, duration, features, popular } = req.body;
    
    // Validate required fields
    if (!name || !price || !duration || !features) {
      return res.status(400).json({ 
        message: 'Name, price, duration, and features are required' 
      });
    }

    const newPlan = new SubscriptionPlan({
      name,
      price,
      duration,
      features: Array.isArray(features) ? features : [features],
      popular: popular || false
    });

    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update subscription plan
router.put('/:id', async (req, res) => {
  try {
    const { name, price, duration, features, popular } = req.body;
    
    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        duration,
        features: Array.isArray(features) ? features : [features],
        popular
      },
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE subscription plan (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const deletedPlan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!deletedPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    res.json({ message: 'Subscription plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;