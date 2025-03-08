const mongoose = require('mongoose');
const logger = require('../controllers/LoggerController');
const { loggerStatus, OPERATIONS } = require('../config/LoggerObject');
require('dotenv').config();

//---------- For Atlas DB -------------//
const connectDB_atlas = async () => {
  const db_atlas = process.env.DB_URl;
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(db_atlas);
    await mongoose.connection.db.admin('admin').command({ ping: 1 });
    console.log('MongoDB Atlas Connected..!!');
    logger.logActivity(loggerStatus.INFO, null, 'MongoDB Atlas Connected!', null, OPERATIONS.MONGODB.CONNECT);
  } catch (err) {
    console.log('MongoDB Atlas Connection failed!');
    console.error(err.message);
    logger.logActivity(loggerStatus.INFO, null, 'MongoDB Atlas Connection failed!', err.message, OPERATIONS.MONGODB.CONNECT);
    process.exit(1);
  }
};
//--------------- END ------------------//


module.exports = connectDB_atlas;