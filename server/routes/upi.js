const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/upiController');

router.post('/initiate', auth, ctrl.initiatePayment);
router.get('/status/:token', auth, ctrl.getStatus);
router.post('/confirm/:token', auth, ctrl.confirmPayment);
router.post('/fail/:token', auth, ctrl.failPayment);

module.exports = router;
