const { createLogger, transports, format } = require('winston');
require('winston-mongodb');
require('dotenv').config();

const logger = createLogger({
    transports: [
        new transports.MongoDB({
            level: 'info',
            db: process.env.DB_URl,
            options: {
                useUnifiedTopology: true
            },
            collection: 'applog',
            format: format.combine(format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}), format.json())
        })
    ]
})

module.exports = logger;