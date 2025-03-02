const router = require('express').Router();
const authController = require('../controllers/authController');
const { validateOpenRequest } = require('../auth/request-validation');
const { checkToken } = require('../auth/Token_validation');

router.post('/login', validateOpenRequest, authController.login);
router.put('/changepass', validateOpenRequest, checkToken, authController.changePassword);




module.exports = router