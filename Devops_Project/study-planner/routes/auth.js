const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/auth');

router.get('/login', redirectIfAuthenticated, authController.getLogin);
router.post('/login', redirectIfAuthenticated, authController.postLogin);
router.get('/register', redirectIfAuthenticated, authController.getRegister);
router.post('/register', redirectIfAuthenticated, authController.postRegister);
router.post('/logout', authController.logout);
router.get('/logout', authController.logout);

module.exports = router;
