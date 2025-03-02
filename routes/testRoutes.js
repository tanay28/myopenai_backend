const router = require('express').Router();
const logController = require('../controllers/logMonitorController');
const { validateOpenRequest } = require('../auth/request-validation');
const { checkToken } = require('../auth/Token_validation');
const testController = require('../controllers/TestController');


router.get('/getalllogs', validateOpenRequest, checkToken, logController.getAllLogs);
router.get('/testme', testController.testMe);


module.exports = router;