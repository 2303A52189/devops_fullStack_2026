const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', plannerController.index);
router.get('/ai-schedule', plannerController.getAISchedule);
router.get('/create', plannerController.getCreate);
router.post('/', plannerController.postCreate);
router.get('/:id', plannerController.show);
router.get('/:id/edit', plannerController.getEdit);
router.put('/:id', plannerController.putEdit);
router.delete('/:id', plannerController.delete);
router.post('/:id/complete', plannerController.markComplete);

module.exports = router;
