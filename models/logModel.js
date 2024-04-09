const mongoose = require ('mongoose');

const logSchema = new mongoose.Schema ({
    username: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    log: [{
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        date: {
            type: String,
            required: true
        }
    }]
});

module.exports = mongoose.model('Log', logSchema);