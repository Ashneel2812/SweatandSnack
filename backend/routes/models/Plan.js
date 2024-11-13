const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  dietPlan: {
    type: Object,
    required: true
  },
  workoutPlan: {
    type: Object,
    required: true
  },
  dietMacros: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Plan', PlanSchema, 'EmailPlan');
