const logger = require('./LoggerController');
const { loggerStatus, OPERATIONS } = require('../config/LoggerObject');
const Users = require('../model/usermodel');
require('dotenv').config();
const { hash } = require("bcrypt");
const BCRYPT_SALT_ROUNDS = 12;

module.exports = {

    registerUser: async (req, res) => {
        const { userFullName, userEmail, userPassword, userPhoneNo, userAddress } = req.body;

        if (!userFullName || !userEmail || !userPassword || !userPhoneNo || !userAddress) {
            logger.logActivity(loggerStatus.ERROR, req.body, 'FullName, email, password, phone no, address required!', null, OPERATIONS.USERS.CREATE);
            res.status(500).json({ message: 'FullName, email, password, phone no and address required!' });
            return;
        }
       
        if(userPhoneNo.length != 10) {
            logger.logActivity(loggerStatus.ERROR, req.body, 'A phone no should have 10 digits.!!', null, OPERATIONS.USERS.CREATE);
            res.status(500).json({ message: 'A phone no should have 10 digits.!!' });
            return;
        }
        
        // Validate duplicate email ids 
        try {
            const alreadyExistsUser = await Users.findOne({email : userEmail }).catch((err) => {
                logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to fetch data from DB', err, OPERATIONS.USERS.CREATE);
            });

            if (alreadyExistsUser) {
                logger.logActivity(loggerStatus.ERROR, req.body, 'User with email already exists!', null, OPERATIONS.USERS.CREATE);
                res.status(409).json({ message: 'User with email already exists!' });
                return;
            }    
        } catch (error) {
            logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to execute db query to select', error, OPERATIONS.USERS.CREATE);
        }
       
        
        // Validate duplicate phone numbers 
        try {
            const alreadyExistsPhoneno = await Users.findOne({ phoneNo : userPhoneNo }).catch((err) => {
                logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to fetch data from DB', err, OPERATIONS.USERS.CREATE);
            });

            if (alreadyExistsPhoneno) {
                logger.logActivity(loggerStatus.ERROR, req.body, 'User with phone no already exists!', null, OPERATIONS.USERS.CREATE);
                res.status(409).json({ message: 'User with phone no already exists!' });
                return;
            }    
        } catch (error) {
            logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to execute db query to select', error, OPERATIONS.USERS.CREATE);
        }   
        
        try {
            const newUser = new Users({ 
                fullName : userFullName, 
                email: userEmail, 
                password : await hash(userPassword, BCRYPT_SALT_ROUNDS),
                phoneNo : userPhoneNo,
                address: userAddress, 
                access : true,
                role: (req.body.isAdmin !== undefined && req.body.isAdmin == true) ? 1 : 2 
            });

            const savedUser = await newUser.save();
        
            if (savedUser) {
                logger.logActivity(loggerStatus.INFO, req.body, 'Registration Successful!!', null, OPERATIONS.USERS.CREATE);
                const userDetails = {
                    id : savedUser.id,
                    fullName : savedUser.fullName,
                    email : savedUser.email
                }
                res.json({ 
                    message: 'Registration Successful!!',
                    data: userDetails
                });
            }
        } catch (error) {
            logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to execute db query to create', error, OPERATIONS.USERS.CREATE);
        }
    },

    getAllUser: async (req, res) => {
        try {
            const allExistingsUser = await Users.find().catch((err) => {
                logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to fetch all users', err, OPERATIONS.USERS.RETRIEVE);
            });

            if (allExistingsUser.length > 0) {
                logger.logActivity(loggerStatus.INFO, req.body, 'All Users are retrieved!!', null, OPERATIONS.USERS.RETRIEVE);
                res.status(200).json({ 
                    message: 'All Users are retrieved!!',
                    data: allExistingsUser
                });
            }  else {
                logger.logActivity(loggerStatus.INFO, req.body, 'No user found!!', null, OPERATIONS.USERS.RETRIEVE);
                res.status(404).json({ message: 'No user found!!' });
            }

        } catch (error) {
            console.error(error);
            logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to execute db query to select', error, OPERATIONS.USERS.RETRIEVE);
        }  
    },

    activateUser : async (req, res, next) => {
        const { username } = req.body;
        if(username != null) {
            let userCredential;
            if (username.includes('@')) {
                // Username type email
                userCredential = await Users.findOne({ email : username }).catch((err) => {
                    logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to fetch data from DB', err, OPERATIONS.AUTH.ACTIVATION);
                });
            } else {
                // Username type phoneNo
                userCredential = await Users.findOne({ phoneNo : username }).catch((err) => {
                    logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to fetch data from DB', err, OPERATIONS.AUTH.ACTIVATION);
                });
            }

            if (userCredential && userCredential != null) { 
                await Users.updateMany({ _id: userCredential._id }, { $set: { access: true } }).catch((err) => {
                    logger.logActivity(loggerStatus.ERROR, username, 'Internal server error!!', err, OPERATIONS.AUTH.ACTIVATION);
                    res.status(500).json({
                        status:500,
                        data: 'Internal server error..!! Please try after some time.'
                    });
                    return;
                });
                
                logger.logActivity(loggerStatus.ERROR, username, 'User activated!!', null, OPERATIONS.AUTH.ACTIVATION);
                res.status(200).json({
                    status: 200,
                    user: username
                });
            } else {
                logger.logActivity(loggerStatus.ERROR, username, 'Invalid username!!', null, OPERATIONS.AUTH.ACTIVATION);
                res.status(400).json({
                    status:400,
                    data: 'Invalid username!!'
                });
                return; 
            }
        } else {
            logger.logActivity(loggerStatus.ERROR, username, 'Username is required', error, OPERATIONS.AUTH.ACTIVATION);
        }
    },

    deactivateUser : async (req, res, next) => {
        const { username } = req.body;
        if(username != null) {
            let userCredential;
            if (username.includes('@')) {
                // Username type email
                userCredential = await Users.findOne({ email : username }).catch((err) => {
                    logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to fetch data from DB', err, OPERATIONS.AUTH.LOGIN);
                });
            } else {
                // Username type phoneNo
                userCredential = await Users.findOne({ phoneNo : username }).catch((err) => {
                    logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to fetch data from DB', err, OPERATIONS.AUTH.LOGIN);
                });
            }

            if (userCredential && userCredential != null) { 
                const user = await Users.updateMany({ _id: userCredential._id }, {$set: {  access: false } }).catch((err) => {
                    logger.logActivity(loggerStatus.ERROR, username, 'Internal server error!!', err, OPERATIONS.AUTH.ACTIVATION);
                    res.status(500).json({
                        status:500,
                        data: 'Internal server error..!! Please try after some time.'
                    });
                    return;
                });
                
                if(user != null) {
                    logger.logActivity(loggerStatus.INFO, username, 'User deactivated!!', null, OPERATIONS.AUTH.ACTIVATION);
                    res.status(200).json({
                        status: 200,
                        user: username
                    });
                } else {
                    res.status(500).json({
                        status: 500,
                        msg: 'Something went wrong!! Please try again after some time.'
                    });
                    return;
                }
            } else {
                logger.logActivity(loggerStatus.ERROR, username, 'Invalid username!!', null, OPERATIONS.AUTH.ACTIVATION);
                res.status(400).json({
                    status:400,
                    data: 'Invalid username!!'
                });
                return; 
            }
        } else {
            logger.logActivity(loggerStatus.ERROR, username, 'Username is required', error, OPERATIONS.AUTH.ACTIVATION);
            res.status(400).json({
                status:400,
                data: 'Username is required.!'
            });
            return; 
        }
    },

    forgotPassword : async (req, res, next) => {
        const { phoneNo } = req.body;
        if(phoneNo == null) { 
            logger.logActivity(loggerStatus.ERROR, phoneNo, 'Phone No is required', error, OPERATIONS.AUTH.FORGOT_PASS);
            res.status(400).json({
                status:400,
                data: 'Phone no is required.!'
            });
            return; 
        } else {
            const user = await Users.findOne({ phoneNo: phoneNo }).catch((err) => {
                logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to fetch data from DB', err, OPERATIONS.AUTH.FORGOT_PASS);
            });
            if (user && user != null) {
                const otpExists = await OtpSchema.findOne({ phoneNo: phoneNo }).catch((err) => {
                    logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to fetch data from DB', err, OPERATIONS.AUTH.FORGOT_PASS);
                });
                if (otpExists != null) {
                    logger.logActivity(loggerStatus.ERROR, req.body, 'OTP already created', null, OPERATIONS.AUTH.FORGOT_PASS);
                    res.status(500).json({
                        status: 500,
                        msg: 'OTP already created.!! Please try after 10 mins.',
                        phoneNo: phoneNo
                    });
                    return;
                }
                const otp = between(1000,9999);
                try {
                    const otpSchemaObj = {
                        otp: otp,
                        phoneNo: phoneNo
                    };
                    sendOtpViaEmail(user.email, otp);
                    let otpData = new OtpSchema(otpSchemaObj);
                    await otpData.save();
                    logger.logActivity(loggerStatus.ERROR, JSON.stringify(otpSchemaObj), 'OTP Sent successfully!!', null, OPERATIONS.AUTH.FORGOT_PASS);
                    res.status(200).json({
                        status: 200,
                        msg: 'OTP Sent successfully!!',
                        email: user.email
                    });
                } catch (error) {
                    logger.logActivity(loggerStatus.ERROR, phoneNo, 'Unable to send OTP.!! Please try again.', null, OPERATIONS.AUTH.FORGOT_PASS);

                    res.status(500).json({
                        status: 500,
                        msg: 'Unable to send OTP.!! Please try again.',
                        email: user.email
                    });
                }
                
            } else {
                logger.logActivity(loggerStatus.ERROR, phoneNo, 'Invalid Phone no!!', null, OPERATIONS.AUTH.FORGOT_PASS);
                res.status(400).json({
                    status:400,
                    data: 'Invalid Phone no!!'
                });
                return;
            }
        }
    },

    createNewPassword: async (req, res, next) => {
        const { newPassword, phoneNo } = req.body;

        if (newPassword == null || phoneNo == null) {
            logger.logActivity(loggerStatus.ERROR, req.body, 'Phone No and New Password required..!!', error, OPERATIONS.AUTH.NEW_PASS);
            res.status(400).json({
                status:400,
                data: 'Phone no and New password is required.!! Please try again later.'
            });
            return; 
        } else {
            const user = await Users.findOne({ phoneNo: phoneNo }).catch((err) => {
                logger.logActivity(loggerStatus.ERROR, req.body, 'Unable to fetch data from DB', err, OPERATIONS.AUTH.NEW_PASS);
            });

            if (user && user != null) {
                const salt = process.env.SALT;
                const newpass = await hash(newPassword, BCRYPT_SALT_ROUNDS);
                const userUpdated = await Users.updateOne({ _id: user._id }, { password: newpass }).catch((err) => {
                    logger.logActivity(loggerStatus.ERROR, userUpdated, 'Internal server error!!', err, OPERATIONS.AUTH.NEW_PASS);
                    res.status(500).json({
                        status:500,
                        data: 'Internal server error..!! Please try after some time.'
                    });
                    return;
                });

                if(userUpdated != null) {
                    logger.logActivity(loggerStatus.INFO, userUpdated, 'Password reset successfully!!', null, OPERATIONS.AUTH.NEW_PASS);
                    res.status(200).json({
                        status: 200,
                        user: phoneNo
                    });
                } else {
                    logger.logActivity(loggerStatus.ERROR, user.phoneNo, 'Internal server error.!! Please try after some time.', null, OPERATIONS.AUTH.NEW_PASS);
                    res.status(500).json({
                        status: 500,
                        msg: 'Internal server error.!! Please try after some time.'
                    });
                    return;
                }
            } else {
                logger.logActivity(loggerStatus.ERROR, phoneNo, 'User not found!!', null, OPERATIONS.AUTH.NEW_PASS);
                res.status(404).json({
                    status: 404,
                    msg: "User not found!!"
                });
                return;
            }
        }   
    }
}

