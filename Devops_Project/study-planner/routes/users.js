const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.use(isAuthenticated, isAdmin);

router.get('/', userController.index);
router.put('/:id/role', userController.changeRole);
router.put('/:id/toggle-active', userController.toggleActive);
router.delete('/:id', userController.deleteUser);

module.exports = router;
