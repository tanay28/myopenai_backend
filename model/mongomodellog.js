const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        require: true
    },  
    level: {
        type: String,
        require: true
    },
    message: {
        type: String,
        require: true
    },
    meta: {
        type: String,
        require: false
    }
});

module.exports = mongoose.model('applog', logSchema,"applog");