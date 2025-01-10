// routes for everything moods
const express = require('express');
const router = express.Router();
const moodController = require('../controller/moodController');

// mood routes
router.post('/inputMood', moodController.inputMood);
router.get('/view-mood-chart', moodController.viewMoodChart);
router.get('/view-mood', moodController.viewMood);
