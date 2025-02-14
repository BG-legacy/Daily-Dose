const express = require('express');
const router = express.Router();
const journalController = require('../controller/journalController');

/**
 * Journal Routes Configuration
 * All routes are prefixed with /api/journal
 * 
 * Authentication:
 * - All routes require valid authentication token
 * - Token format: Bearer <token>
 * - Supports both Google OAuth and regular JWT tokens
 */

/**
 * POST /api/journal/thoughts
 * Creates a new journal entry
 * 
 * @requires authentication
 * @body {Object} request
 * @body {string} request.thought - The journal entry content
 * @returns {Object} Created journal entry with AI insights
 */
router.post('/thoughts', journalController.addThought);

/**
 * GET /api/journal/history
 * Retrieves all journal entries for the authenticated user
 * 
 * @requires authentication
 * @returns {Array<Object>} List of journal entries
 */
router.get('/history', journalController.getHistory);

/**
 * GET /api/journal/thoughts/:thoughtId
 * Retrieves a specific journal entry
 * 
 * @requires authentication
 * @param {string} thoughtId - Format: userID#timestamp
 * @returns {Object} Journal entry with AI insights
 * @throws {404} If entry not found
 * @throws {403} If user not authorized to access entry
 */
router.get('/thoughts/:thoughtId', journalController.getThought);

/**
 * DELETE /api/journal/thoughts/:thoughtId
 * Deletes a specific journal entry
 * 
 * @requires authentication
 * @param {string} thoughtId - Format: userID#timestamp
 * @returns {Object} Success message
 * @throws {404} If entry not found
 * @throws {403} If user not authorized to delete entry
 */
router.delete('/thoughts/:thoughtId', journalController.deleteThought);

/**
 * Response Format for Journal Entries:
 * {
 *   id: string,           // Composite key: userID#timestamp
 *   Content: string,      // User's journal entry
 *   CreationDate: string, // ISO date string
 *   UserID: string,       // User identifier
 *   Quote: string,        // AI-generated quote
 *   MentalHealthTip: string, // AI-generated mental health tip
 *   Hack: string         // AI-generated productivity hack
 * }
 */

module.exports = router;

/**
 * Security Considerations:
 * 1. All routes require authentication
 * 2. Users can only access their own entries
 * 3. Composite keys prevent unauthorized access
 * 4. Input validation in controller
 * 5. Error handling for all operations
 * 
 * Performance Notes:
 * 1. Uses DynamoDB for fast retrieval
 * 2. Composite keys for efficient querying
 * 3. Pagination for large result sets
 * 4. Proper error handling
 * 
 * Integration Points:
 * 1. Frontend journal.js API client
 * 2. DynamoDB journals table
 * 3. OpenAI API for insights
 * 4. Authentication middleware
 */

