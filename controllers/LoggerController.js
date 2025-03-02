const logger = require('../config/Logger');

module.exports = {
    logActivity: (status, data, errMsg, errObj, operation) => {
        const errLog = {
            status: status,
            data: data,
            statusMsg: errMsg,
            errorObj: errObj,
            operation: operation
        }

        if ( status === 'info') {
            logger.info(JSON.stringify(errLog));
        } else {
            logger.error(JSON.stringify(errLog));
        }
    }
}