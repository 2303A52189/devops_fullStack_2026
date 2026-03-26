const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(isAuthenticated);

router.get('/', profileController.getProfile);
router.put('/', upload.single('avatar'), profileController.updateProfile);
router.put('/password', profileController.changePassword);

module.exports = router;
