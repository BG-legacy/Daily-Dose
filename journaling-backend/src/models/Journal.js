/**
 * Journal Model for MongoDB
 * Defines the schema for journal entries
 */

const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    UserID: {
        type: String,
        required: true,
        index: true
    },
    Content: {
        type: String,
        required: true
    },
    Quote: {
        type: String,
        default: ''
    },
    MentalHealthTip: {
        type: String,
        default: ''
    },
    Hack: {
        type: String,
        default: ''
    },
    CreationDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    Type: {
        type: String,
        default: 'JOURNAL',
        enum: ['JOURNAL', 'MOOD']
    }
}, {
    timestamps: true,
    collection: 'journals'
});

// Compound index for efficient querying by user and date
journalSchema.index({ UserID: 1, CreationDate: -1 });
journalSchema.index({ UserID: 1, Type: 1, CreationDate: -1 });

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;

