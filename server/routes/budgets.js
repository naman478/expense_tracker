const express = require('express');
const { body, validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all budgets for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { month } = req.query;
    let query = { userId: req.user._id };
    
    if (month) {
      query.month = month;
    }

    const budgets = await Budget.find(query).sort({ month: -1, category: 1 });
    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new budget
router.post('/', [
  auth,
  body('category').isIn(['Food', 'Rent', 'Shopping', 'Transportation', 'Entertainment', 'Healthcare', 'Education', 'Utilities', 'Travel', 'Others']).withMessage('Invalid category'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if budget already exists for this category and month
    const existingBudget = await Budget.findOne({
      userId: req.user._id,
      category: req.body.category,
      month: req.body.month
    });

    if (existingBudget) {
      // Update existing budget
      existingBudget.amount = req.body.amount;
      await existingBudget.save();
      return res.json(existingBudget);
    }

    // Create new budget
    const budget = new Budget({
      ...req.body,
      userId: req.user._id
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update budget
router.put('/:id', [
  auth,
  body('amount').optional().isNumeric().withMessage('Amount must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete budget
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;