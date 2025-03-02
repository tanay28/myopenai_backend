const logger = require('./LoggerController');
const { loggerStatus, OPERATIONS } = require('../config/LoggerObject');

module.exports = {

    testMe: async (req, res) => {
        res.send("Hello There!!");
    }
}