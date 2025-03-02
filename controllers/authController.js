const logger = require('./LoggerController');
const { loggerStatus, OPERATIONS } = require('../config/LoggerObject');
const Users = require('../model/usermodel');
const { compareSync, hashSync, compare } = require("bcrypt");
const { sign } = require("jsonwebtoken");
require('dotenv').config();

const processLogin = async (userCredential, password, username) => {
    try {
        const result = await compare(password, userCredential.password);
        if (result) {
            userCredential.password = undefined;
            const jsontoken = sign({ result: userCredential }, process.env.SALT, {
                expiresIn: "3h"
            });
            logger.logActivity(loggerStatus.INFO, username, 'login successfully processed', null, OPERATIONS.AUTH.LOGIN);
            return jsontoken;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Login Error => ', error);
        logger.logActivity(loggerStatus.ERROR, username, 'Unable to process login!', error, OPERATIONS.AUTH.LOGIN);
    }
}

module.exports = {

    login : async (req, res, next) => {
        const { username, password } = req.body;
        
        if (!username || !password) {
            logger.logActivity(loggerStatus.ERROR, req.body, 'Username and Password required.!!', null, OPERATIONS.AUTH.LOGIN);
            res.status(400).json({ message: 'Username and Password required.!!' });
            return;
        }
        let userCredential;
        if (username.includes('@')) {
            // Find credential with user email as username
            userCredential = await Users.findOne({ email : username }).catch((err) => {
                logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to fetch data from DB', err, OPERATIONS.AUTH.LOGIN);
            });
        } else {
            // Find credential with user phone no as username
            userCredential = await Users.findOne({ phoneNo : username }).catch((err) => {
                logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to fetch data from DB', err, OPERATIONS.AUTH.LOGIN);
            });
        }
       
        if (userCredential && userCredential != null) {
            if (userCredential.access) {
                const jsontoken = await processLogin(userCredential, password, username)
                if (jsontoken != null) {
                    res.status(200).json({
                        status: 200,
                        message: "login successfully",
                        token: jsontoken
                    });
                    return;
                } else {
                    logger.logActivity(loggerStatus.ERROR, username, 'Invalid password!!', null, OPERATIONS.AUTH.LOGIN);
                    res.status(400).json({
                        status:400,
                        data: "Invalid password!!"
                    });
                    return;
                }
            } else {
                logger.logActivity(loggerStatus.ERROR, username, 'Account is inavtive', null, OPERATIONS.AUTH.LOGIN);
                res.status(400).json({
                    status:400,
                    data: "This account is not yet activated.!! Please contact your system adminstrator."
                });
                return;
            }
           
        } else {
            logger.logActivity(loggerStatus.ERROR, username, 'Invalid username!!', null, OPERATIONS.AUTH.LOGIN);
            res.status(400).json({
                status:400,
                data: "Invalid username!!"
            });
            return;
        }
    },

    changePassword: async (req, res, next) => {
        const { userEmail, newPassword } = req.body;
        
        if (!userEmail || !newPassword) {
            logger.logActivity(loggerStatus.ERROR, req.body, 'Email and Password required.!!', null, OPERATIONS.AUTH.CHNAGE_PASS);
            res.status(400).json({ message: 'Email and Password required.!!' });
            return;
        } else {
            userCredential = await Users.findOne({ where: { email : userEmail } }).catch((err) => {
                logger.logActivity(loggerStatus.ERROR, userEmail, 'Unable to fetch data from DB', err, OPERATIONS.AUTH.CHNAGE_PASS);
            });

            if (userCredential && userCredential != null) {
                const salt = process.env.SALT;
                const newpass = hashSync(newPassword, salt);
                const userUpdated = await Users.update({ password: newpass}, { where: { id: userCredential.id }}).catch((err) => {
                    logger.logActivity(loggerStatus.ERROR, userEmail, 'Internal server error!!', err, OPERATIONS.AUTH.CHNAGE_PASS);
                    res.status(500).json({
                        status:500,
                        data: 'Internal server error..!! Please try after some time.'
                    });
                    return;
                });
                if (userUpdated && userUpdated != null) {
                    logger.logActivity(loggerStatus.INFO, userUpdated, 'Password changed successfully!!', null, OPERATIONS.AUTH.CHNAGE_PASS);
                    res.status(200).json({
                        username: userEmail,
                        msg: 'Password changed successfully.!'
                    });
                    return;
                } else {
                    logger.logActivity(loggerStatus.ERROR, userEmail, 'Internal server error.!! Please try after some time.', null, OPERATIONS.AUTH.CHNAGE_PASS);
                    res.status(500).json({
                        status: 500,
                        msg: 'Internal server error.!! Please try after some time.'
                    });
                    return;
                }

            } else {
                logger.logActivity(loggerStatus.ERROR, userEmail, 'User not found!!', null, OPERATIONS.AUTH.CHNAGE_PASS);
                res.status(404).json({
                    status: 404,
                    msg: "User not found!!"
                });
                return;
            }
        }
    }
}