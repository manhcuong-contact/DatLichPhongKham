/**
 * Script chạy tất cả SQL files vào SQL Server
 * Sử dụng mssql package
 */
require('dotenv').config();
const sql  = require('mssql');
const fs   = require('fs');
const path = require('path');

const config = {
  server:   process.env.DB_SERVER   || 'DESKTOP-1JQFEUE',
  database: 'master',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USERNAME || 'cuong',
      password: process.env.DB_PASSWORD || '123456',
    }
  },
  options: {
    instanceName:           process.env.DB_INSTANCE || 'SQLEXPRESS',
    encrypt:                false,
    trustServerCertificate: true,
    connectTimeout:         30000,
    requestTimeout:         60000,
  }
};

const DB_DIR = path.join(__dirname, 'database');
const SCRIPTS = ['01_schema.sql','02_procedures.sql','03_views.sql','04_triggers.sql','05_seed.sql'];

async function runScript(pool, filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Tách theo GO (SQL Server batch separator)
  const batches = content.split(/^\s*GO\s*$/im).map(b => b.trim()).filter(b => b.length > 0);

  for (const batch of batches) {
    try {
      await pool.request().query(batch);
    } catch (err) {
      // Bỏ qua một số lỗi không nghiêm trọng
      if (err.message.includes('already an object named') ||
          err.message.includes('already exists')) {
        process.stdout.write('⚠ ');
      } else {
        throw err;
      }
    }
  }
}

async function main() {
  let pool;
  try {
    console.log('🔗 Kết nối SQL Server...');
    pool = await sql.connect(config);
    console.log('✅ Kết nối thành công!\n');

    for (const script of SCRIPTS) {
      const filePath = path.join(DB_DIR, script);
      if (!fs.existsSync(filePath)) {
        console.log(`⏭  Skip (không tồn tại): ${script}`);
        continue;
      }
      process.stdout.write(`▶  Chạy ${script}... `);
      try {
        await runScript(pool, filePath);
        console.log('✅');
      } catch (err) {
        console.log(`\n❌ Lỗi trong ${script}:`);
        console.log(`   ${err.message}`);
        throw err;
      }
    }

    console.log('\n🎉 Tất cả scripts chạy thành công!');
    console.log('📊 Database MediFlowDB đã sẵn sàng.');
    console.log('\n🔑 Tài khoản mặc định:');
    console.log('   Admin   : admin@mediflow.com / Admin@123456');
    console.log('   Patient : patient1@mediflow.com / Admin@123456');
    console.log('   Doctor  : dr.an@mediflow.com / Admin@123456');

  } catch (err) {
    console.error('\n❌ Lỗi:', err.message);
    process.exit(1);
  } finally {
    if (pool) await pool.close();
    process.exit(0);
  }
}

main();
