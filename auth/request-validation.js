const logger = require('../config/Logger');

module.exports = {
    validateOpenRequest: (req, res, next) => {
        if(req.get('content-type') != undefined && req.get('requested-timestamp') != undefined) {
            next();
        } else {
            res.status(400).json({
                msg: 'Missing these header informations.(content-type, requested-timestamp)'
            });
        }
    }
}