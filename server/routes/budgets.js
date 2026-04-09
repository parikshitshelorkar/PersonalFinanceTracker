const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/budgetController');

router.get('/alerts', auth, ctrl.getAlerts);
router.get('/', auth, ctrl.getAll);
router.post('/', auth, ctrl.create);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
