const express = require('express');
const router = express.Router();
const diagnosticController = require('../controllers/diagnostic.controller');

/**
 * @route   GET /api/v1/diagnostic/problems
 * @desc    Get all available diagnostic problems
 * @access  Public
 */
router.get('/problems', diagnosticController.getAvailableProblems.bind(diagnosticController));

/**
 * @route   GET /api/v1/diagnostic/search
 * @desc    Search for problems by keyword
 * @access  Public
 */
router.get('/search', diagnosticController.searchProblems.bind(diagnosticController));

/**
 * @route   POST /api/v1/diagnostic/:problemId/start
 * @desc    Start a diagnostic session
 * @access  Public
 */
router.post('/:problemId/start', diagnosticController.startDiagnostic.bind(diagnosticController));

/**
 * @route   POST /api/v1/diagnostic/:problemId/answer
 * @desc    Submit answer and get next question or diagnosis
 * @access  Public
 */
router.post('/:problemId/answer', diagnosticController.submitAnswer.bind(diagnosticController));

module.exports = router;
