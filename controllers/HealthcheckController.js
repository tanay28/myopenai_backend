
const { version } = require('../package.json');

const healthCheck = (req, res) => {
    const healthcheckData = {
        Message: `Backend Service is up and running..!!`,
        port: process.env.PORT,
        applicationVersion: version, 
        uptime: process.uptime(),
        responseTime: process.hrtime(),
        status: 'OK',
        timestamp: Date.now()
    };
    res.status(200).send(healthcheckData);
}
module.exports = {
    healthCheck
}
