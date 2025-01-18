const express = require('express');
const router = express.Router();
const journalController = require('../controller/journalController');

// Middleware to verify user is logged in (you'll need to implement this)
const authMiddleware = require('../middleware/auth');

// Journal routes
router.post('/thoughts', authMiddleware, journalController.addThought);
router.get('/history', authMiddleware, journalController.getHistory);
router.get('/thoughts/:thoughtId', authMiddleware, journalController.getThought);
router.delete('/thoughts/:thoughtId', authMiddleware, journalController.deleteThought);

module.exports = router;

