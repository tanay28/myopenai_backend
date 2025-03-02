const LogSchema = require('../model/mongomodellog');
const moment = require('moment');

module.exports = {
    getAllLogs: async (req, res, next) => {
        const logdata = await LogSchema.find({}).catch(err => {
            console.error('Unable to fet data from DB..!! ', err);
        });
        if(logdata && logdata.length > 0) {
            let formatedLog = [];
            logdata.forEach((log) => {
                let logObj = {
                    id: log._id,
                    timestamp: moment(log.timestamp).format('DD-MM-YYYY HH:mm:ss'),
                    value: JSON.parse(log.message)
                };
                formatedLog.push(logObj);
            });
           res.send(formatedLog);
        } else {
            res.status(404).json({
                msg: 'No logs found.!! Please try again.' 
            });
        }
    }
}