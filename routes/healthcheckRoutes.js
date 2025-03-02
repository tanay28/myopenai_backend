const router = require('express').Router();
const heathcheckController = require('../controllers/HealthcheckController');

router.get('/healthcheck', heathcheckController.healthCheck);




module.exports = router