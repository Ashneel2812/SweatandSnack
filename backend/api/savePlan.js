const { savePlan } = require('../controllers/savePlan');

module.exports = async (req, res) => {
  try {
    await savePlan(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save plan' });
  }
};
