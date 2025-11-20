/**
 * MongoDB User Manager Utility
 * Handles all user-related database operations using MongoDB
 */

const User = require('../models/User');
const mongoConnection = require('./mongodb');
const { trackDatabaseOperation } = require('./performance');

/**
 * UserManager Class
 * Manages user operations in MongoDB
 * Handles CRUD operations for user data
 */
class UserManager {
    constructor() {
        // Ensure MongoDB connection is established
        this.ensureConnection();
    }

    /**
     * Ensure MongoDB connection is established
     */
    async ensureConnection() {
        try {
            if (!mongoConnection.isHealthy()) {
                await mongoConnection.connect();
            }
        } catch (error) {
            console.error('Failed to establish MongoDB connection:', error);
        }
    }

    /**
     * Add a new user to the database
     * @param {Object} userData - User information
     * @param {string} userData.UserID - Unique user identifier
     * @param {string} userData.Name - User's name
     * @param {string} userData.Email - User's email
     * @param {string} [userData.CreationDate] - Account creation date
     * @returns {Promise<Object>} Created user
     */
    async addUser(userData) {
        const startTime = Date.now();
        try {
            await this.ensureConnection();

            const user = new User({
                UserID: String(userData.UserID),
                Name: String(userData.Name),
                Email: String(userData.Email),
                CreationDate: userData.CreationDate || new Date()
            });

            const savedUser = await user.save();
            const duration = Date.now() - startTime;
            trackDatabaseOperation('addUser', duration);
            
            console.log("User added successfully:", savedUser.UserID);
            return savedUser;
        } catch (error) {
            const duration = Date.now() - startTime;
            trackDatabaseOperation('addUser_error', duration);
            
            // Handle duplicate key error
            if (error.code === 11000) {
                console.error("User already exists with this email or UserID");
                throw new Error('User already exists');
            }
            
            console.error("Error adding user:", error);
            throw error;
        }
    }

    /**
     * Retrieve a user by their ID
     * @param {string} userID - User's unique identifier
     * @returns {Promise<Object|null>} User data or null if not found
     */
    async getUser(userID) {
        const startTime = Date.now();
        console.log("Getting user with ID:", userID);

        try {
            await this.ensureConnection();

            const user = await User.findOne({ UserID: String(userID) }).lean();
            const duration = Date.now() - startTime;
            trackDatabaseOperation('getUser', duration);

            if (!user) {
                console.log("User not found:", userID);
                return null;
            }

            return user;
        } catch (error) {
            const duration = Date.now() - startTime;
            trackDatabaseOperation('getUser_error', duration);
            console.error("Error in getUser:", error);
            throw error;
        }
    }

    /**
     * Update user information
     * @param {string} userID - User's unique identifier
     * @param {Object} updateData - Fields to update
     * @returns {Promise<Object>} Updated user data
     */
    async updateUser(userID, updateData) {
        const startTime = Date.now();
        try {
            await this.ensureConnection();

            const updatedUser = await User.findOneAndUpdate(
                { UserID: String(userID) },
                { $set: updateData },
                { new: true, runValidators: true }
            ).lean();

            const duration = Date.now() - startTime;
            trackDatabaseOperation('updateUser', duration);

            if (!updatedUser) {
                throw new Error('User not found');
            }

            console.log('User updated successfully:', userID);
            return updatedUser;
        } catch (error) {
            const duration = Date.now() - startTime;
            trackDatabaseOperation('updateUser_error', duration);
            console.error("Error updating user:", error);
            throw error;
        }
    }

    /**
     * Delete a user from the database
     * @param {string} userID - User's unique identifier
     * @returns {Promise<Object>} Result of deletion operation
     */
    async deleteUser(userID) {
        const startTime = Date.now();
        try {
            await this.ensureConnection();

            const deletedUser = await User.findOneAndDelete({ UserID: String(userID) }).lean();
            const duration = Date.now() - startTime;
            trackDatabaseOperation('deleteUser', duration);

            if (deletedUser) {
                console.log(`Successfully deleted user ${userID}`);
                return {
                    success: true,
                    message: 'User deleted successfully',
                    deletedUser: deletedUser
                };
            } else {
                console.log(`No user found with ID: ${userID}`);
                return {
                    success: false,
                    message: 'No user found with this userID'
                };
            }
        } catch (error) {
            const duration = Date.now() - startTime;
            trackDatabaseOperation('deleteUser_error', duration);
            console.error("Error deleting user:", error);
            throw error;
        }
    }

    /**
     * Find a user by their email address
     * @param {string} email - User's email address
     * @returns {Promise<string|null>} UserID if found, null otherwise
     */
    async getUserByEmail(email) {
        const startTime = Date.now();
        console.log('Looking up user by email:', email);
        
        try {
            await this.ensureConnection();

            const user = await User.findOne({ Email: email.toLowerCase() }).lean();
            const duration = Date.now() - startTime;
            trackDatabaseOperation('getUserByEmail', duration);

            if (user) {
                console.log('Found user:', user);
                return user.UserID;
            } else {
                console.log('No user found with email:', email);
                return null;
            }
        } catch (error) {
            const duration = Date.now() - startTime;
            trackDatabaseOperation('getUserByEmail_error', duration);
            console.error("Error getting user by email:", error);
            throw error;
        }
    }
}

module.exports = UserManager;

