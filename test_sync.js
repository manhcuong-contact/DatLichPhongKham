require('dotenv').config();
const { sequelize } = require('./src/config/database');
require('./src/models'); // load all models + associations

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối OK, đang thử sync...');
    await sequelize.sync({ alter: false, force: false });
    console.log('✅ Sync thành công!');
  } catch (err) {
    console.error('❌ Lỗi sync đầy đủ:\n', err.message);
    if (err.original) console.error('Original error:', err.original.message);
    if (err.sql) console.error('SQL query:', err.sql);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
})();
