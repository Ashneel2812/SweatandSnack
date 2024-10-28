const express = require('express');
const router = express.Router();
const { regeneratePlan } = require('../controllers/regeneratePlan');

router.post('/regenerate-plan', regeneratePlan);

module.exports = router;
