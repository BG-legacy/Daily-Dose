/**
 * User Model for MongoDB
 * Defines the schema for user data
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    UserID: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    CreationDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'users'
});

// Index for email lookups
userSchema.index({ Email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;

