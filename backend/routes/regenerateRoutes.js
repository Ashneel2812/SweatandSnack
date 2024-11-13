const express = require('express');
const router = express.Router();
const { regeneratePlan } = require('../routes/controllers/regeneratePlan');

// Define the route for regenerating the plan
router.post('/regenerate-plan', regeneratePlan);

module.exports = router;
