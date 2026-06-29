/**
 * src/utils/logger.js
 */
const logger = {
  info:  (...args) => console.log('\x1b[36m%s\x1b[0m', '[INFO]', ...args),
  warn:  (...args) => console.warn('\x1b[33m%s\x1b[0m', '[WARN]', ...args),
  error: (...args) => console.error('\x1b[31m%s\x1b[0m', '[ERROR]', ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\x1b[35m%s\x1b[0m', '[DEBUG]', ...args);
    }
  }
};

module.exports = logger;
