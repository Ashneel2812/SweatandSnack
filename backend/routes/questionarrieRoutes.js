const express = require('express');
const router = express.Router();
const { submitQuestionnaire } = require('../routes/controllers/questionarrieSubmit');

router.post('/submit-questionnaire', submitQuestionnaire);

module.exports = router;
