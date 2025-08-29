const express = require('express');
const {
    getSettings,
    updateSettings,
    uploadLogo,
    uploadFavicon
} = require('../controllers/settingController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(protect, authorize('admin'), getSettings)
    .put(protect, authorize('admin'), updateSettings);

router
    .route('/logo')
    .put(protect, authorize('admin'), uploadLogo);

router
    .route('/favicon')
    .put(protect, authorize('admin'), uploadFavicon);

module.exports = router;