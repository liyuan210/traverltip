const express = require('express');
const {
    getDashboardStats
} = require('../controllers/statsController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
    .route('/dashboard')
    .get(protect, authorize('admin', 'editor'), getDashboardStats);

module.exports = router;