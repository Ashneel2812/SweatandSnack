const express = require('express');
const router = express.Router();
const { savePlan } = require('../controllers/savePlan');

router.post('/email-plan', savePlan);

module.exports = router;
