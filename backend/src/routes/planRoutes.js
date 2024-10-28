const express = require('express');
const router = express.Router();
const { savePlan } = require('../controllers/savePlan');

router.post('/save-plan', savePlan);

module.exports = router;
