/**
 * Mood Model for MongoDB
 * Defines the schema for mood entries
 */

const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    UserID: {
        type: String,
        required: true,
        index: true
    },
    Content: {
        type: String,
        required: true,
        lowercase: true,
        enum: ['happy', 'sad', 'upset']
    },
    Timestamp: {
        type: Date,
        required: true,
        index: true
    },
    Type: {
        type: String,
        default: 'MOOD'
    },
    CreationDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'moods'
});

// Compound index for efficient querying
moodSchema.index({ UserID: 1, Timestamp: -1 });
// Unique constraint: one mood per user per day
moodSchema.index({ UserID: 1, Timestamp: 1 }, { unique: true });

const Mood = mongoose.model('Mood', moodSchema);

module.exports = Mood;

