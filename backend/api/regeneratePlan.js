const { regeneratePlan } = require('../controllers/regeneratePlan');

module.exports = async (req, res) => {
  try {
    await regeneratePlan(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to regenerate plan' });
  }
};
