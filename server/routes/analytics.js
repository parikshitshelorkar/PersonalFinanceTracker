const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/analyticsController');

router.get('/category-split', auth, ctrl.getCategorySplit);
router.get('/monthly', auth, ctrl.getMonthly);
router.get('/trend', auth, ctrl.getTrend);
router.get('/insights', auth, ctrl.getInsights);

module.exports = router;
