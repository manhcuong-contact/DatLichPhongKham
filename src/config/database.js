/**
 * src/config/database.js
 * MongoDB Connection using Mongoose
 */
const mongoose = require('mongoose');
const logger = require('../utils/logger');

mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, converted) => {
    delete converted._id;
    delete converted.__v;
  }
});

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mediflow';
    await mongoose.connect(mongoURI);
    logger.info('✅ Kết nối MongoDB thành công!');
    logger.info(`   URI: ${mongoURI}`);
    return mongoose.connection;
  } catch (err) {
    logger.error(`❌ Không thể kết nối MongoDB: ${err.message}`);
    process.exit(1);
  }
};

// Placeholder for raw query fallback (not used in mongo, but keeps imports from crashing before full rewrite)
const query = async () => { throw new Error('Not implemented for MongoDB'); };
const execute = async () => { throw new Error('Not implemented for MongoDB'); };

module.exports = { connectDB, query, execute };
