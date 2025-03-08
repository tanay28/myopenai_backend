require('dotenv').config();
const logger = require('./LoggerController');
const { loggerStatus, OPERATIONS } = require('../config/LoggerObject');
const { MongoClient } = require('mongodb');
const callAgent = require('../config/agent')

// const getMongoClient = async () => {
//     //Init MongoDB Client
//     let client;
//     try {
//         client = new MongoClient(process.env.DB_URl);
//         await client.connect();
//         await client.db("admin").command({ ping: 1 });
//         console.log("You successfully connected to MongoDB with Mongo Client!");
//         logger.logActivity(loggerStatus.INFO, null, 'connected to MongoDB with Mongo Client', null, OPERATIONS.MONGODB.CONNECT_MONGO_CLIENT);
//         return client;
//     } catch (mongoDbErr) {
//         logger.logActivity(loggerStatus.ERROR, null, 'Error connecting mongodb using mongodb client', error, OPERATIONS.MONGODB.CONNECT_MONGO_CLIENT);
//         res.status(500).json({ error: 'Error connecting mongodb using mongodb client!' });
//         return;
//     }
// };

module.exports = {
    checkAi: async (req, res, next) => {
        res.send('Hello there from LangGraph Agent Server');
    },

    startChat: async (req, res, next) => {
        const { message } = req.body;
        let client;
        if (!message) {
            logger.logActivity(loggerStatus.ERROR, req.body, 'Messsage is required', null, OPERATIONS.OPEN_AI.NEW_CHAT);
            res.status(500).json({ message: 'Messsage is required.!!' });
            return;
        }

        // Create a Thread ID
        const threadId = 'openai ' + Date.now().toString();

        //Init MongoDB Client
        try {
            client = new MongoClient(process.env.DB_URl);
            await client.connect();
            await client.db("admin").command({ ping: 1 });
            console.log("You successfully connected to MongoDB with Mongo Client!");
            logger.logActivity(loggerStatus.INFO, null, 'connected to MongoDB with Mongo Client', null, OPERATIONS.MONGODB.CONNECT_MONGO_CLIENT);
        } catch (mongoDbErr) {
            logger.logActivity(loggerStatus.ERROR, null, 'Error connecting mongodb using mongodb client', error, OPERATIONS.MONGODB.CONNECT_MONGO_CLIENT);
            res.status(500).json({ error: 'Error connecting mongodb using mongodb client!' });
            return;
        }

        // Starting Chat
        try {
            const response = await callAgent(client, initialMessage, threadId);
            logger.logActivity(loggerStatus.INFO, response, 'Chat response successful', null, OPERATIONS.OPEN_AI.NEW_CHAT);
            res.status(200).json({ threadId, response });
        } catch (error) {
            logger.logActivity(loggerStatus.ERROR, null, 'Error starting conversation', error, OPERATIONS.OPEN_AI.NEW_CHAT);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    sendMessageInExistingChat: async (req, res, next) => {
        const { threadId } = req.params;
        const { message } = req.body;
        let client;

        if (!message) {
            logger.logActivity(loggerStatus.ERROR, req.body, 'Messsage is required.!!', null, OPERATIONS.OPEN_AI.NEW_CHAT);
            res.status(500).json({ message: 'Messsage is required.!!' });
            return;
        } else if (!threadId) {
            logger.logActivity(loggerStatus.ERROR, req.body, 'Thread Id is required', null, OPERATIONS.OPEN_AI.NEW_MSG);
            res.status(500).json({ message: 'Thread Id is required.! Please pass it in query param.' });
            return;
        }

        //Init MongoDB Client
        try {
            client = new MongoClient(process.env.DB_URl);
            await client.connect();
            await client.db("admin").command({ ping: 1 });
            console.log("You successfully connected to MongoDB with Mongo Client!");
            logger.logActivity(loggerStatus.INFO, null, 'connected to MongoDB with Mongo Client', null, OPERATIONS.MONGODB.CONNECT_MONGO_CLIENT);
        } catch (mongoDbErr) {
            logger.logActivity(loggerStatus.ERROR, null, 'Error connecting mongodb using mongodb client', error, OPERATIONS.MONGODB.CONNECT_MONGO_CLIENT);
            res.status(500).json({ error: 'Error connecting mongodb using mongodb client!' });
            return;
        }

        // pass a new message
        try {
            const response = await callAgent(client, message, threadId);
            logger.logActivity(loggerStatus.INFO, response, 'Successfully sent a message', error, OPERATIONS.OPEN_AI.NEW_MSG);
            res.status(200).json({ response });
        } catch (error) {
            logger.logActivity(loggerStatus.ERROR, null, 'Unable to send a message', error, OPERATIONS.OPEN_AI.NEW_MSG);
            res.status(500).json({ error: 'Unable to send a message' });
        }
    }
}