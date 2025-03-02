module.exports = {
    loggerStatus: {
        INFO: 'info',
        ERROR: 'error'
    },
    OPERATIONS: {
        USERS: {
            CREATE: 'create an user',
            MODIFY: 'modify user info',
            REMOVE: 'remove user info',
            RETRIEVE: 'get all users',
            RETRIEVE_BY_ID: 'get user by id'
        },
        MONGODB: {
            CONNECT: 'mongodb connection'
        },
        AUTH: {
            LOGIN: 'user login',
            ACTIVATION: 'user activation',
            FORGOT_PASS: 'forgot password',
            OTP_VERIFY: 'otp verification',
            NEW_PASS: 'create new password',
            CHNAGE_PASS: 'change old pass'
        }
    }

};