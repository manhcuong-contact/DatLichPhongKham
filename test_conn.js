/**
 * Script kiểm tra kết nối SQL Server dùng tedious (cùng driver với Sequelize)
 */
require('dotenv').config();
const { Connection, Request } = require('tedious');

const server = process.env.DB_SERVER || 'DESKTOP-1JQFEUE';
const instance = process.env.DB_INSTANCE || 'SQLEXPRESS';
const database = process.env.DB_DATABASE || 'MediFlowDB';
const username = process.env.DB_USERNAME || 'cuong';
const password = process.env.DB_PASSWORD || '123456';

console.log('='.repeat(60));
console.log('   KIỂM TRA KẾT NỐI SQL SERVER - MEDIFLOW');
console.log('='.repeat(60));
console.log(`Server   : ${server}\\${instance}`);
console.log(`Database : ${database}`);
console.log(`Username : ${username}`);
console.log(`Password : ${password}`);
console.log('');

function testConnection(config, label) {
  return new Promise((resolve) => {
    console.log(`🔵 Thử kết nối: [${label}]`);
    const connection = new Connection(config);

    const timeout = setTimeout(() => {
      console.log(`❌ Timeout sau 15 giây`);
      resolve(false);
    }, 15000);

    connection.on('connect', (err) => {
      clearTimeout(timeout);
      if (err) {
        console.log(`❌ Lỗi kết nối: ${err.message}`);
        resolve(false);
        return;
      }

      console.log(`✅ KẾT NỐI THÀNH CÔNG!`);

      // Kiểm tra Authentication Mode
      const req1 = new Request(
        `SELECT 
          SUSER_NAME() AS current_user,
          SERVERPROPERTY('IsIntegratedSecurityOnly') AS windows_only,
          DB_NAME() AS db_name`,
        (err, rowCount, rows) => {
          if (!err && rows && rows.length > 0) {
            const getVal = (name) => rows[0].find(c => c.metadata.colName === name)?.value;
            console.log(`   User đang dùng : ${getVal('current_user')}`);
            console.log(`   Database       : ${getVal('db_name')}`);
            const winOnly = getVal('windows_only');
            console.log(`   Auth Mode      : ${winOnly === 1 ? '⚠️  CHỈ Windows Auth → Cần bật Mixed Mode!' : '✅ Mixed Mode (SQL Auth được phép)'}`);
          }

          // Kiểm tra user 'cuong'
          const req2 = new Request(
            `SELECT name, type_desc, is_disabled FROM sys.server_principals WHERE name = '${username}'`,
            (err2, rowCount2, rows2) => {
              connection.close();
              if (!err2 && rows2) {
                if (rows2.length === 0) {
                  console.log(`   User '${username}' : ❌ KHÔNG TỒN TẠI trong SQL Server`);
                  console.log(`\n💡 GIẢI PHÁP: Cần tạo login '${username}' trong SQL Server!`);
                } else {
                  const getVal2 = (name) => rows2[0].find(c => c.metadata.colName === name)?.value;
                  const disabled = getVal2('is_disabled');
                  const typeDesc = getVal2('type_desc');
                  console.log(`   User '${username}' : ${disabled ? '🔴 Đang bị DISABLED' : '🟢 Đang ACTIVE'} (${typeDesc})`);
                  if (disabled) {
                    console.log(`\n💡 GIẢI PHÁP: Cần ENABLE login '${username}' trong SQL Server!`);
                  }
                }
              }
              resolve(true);
            }
          );
          connection.execSql(req2);
        }
      );
      connection.execSql(req1);
    });

    connection.on('error', (err) => {
      clearTimeout(timeout);
      console.log(`❌ Lỗi: ${err.message}`);
      resolve(false);
    });

    connection.connect();
  });
}

async function main() {
  // Test 1: SQL Auth
  const success = await testConnection({
    server,
    options: {
      instanceName: instance,
      database,
      encrypt: false,
      trustServerCertificate: true,
      connectTimeout: 15000,
    },
    authentication: {
      type: 'default',
      options: { userName: username, password }
    }
  }, `SQL Auth: ${server}\\${instance} | User: ${username}`);

  if (!success) {
    console.log('\n🔵 Thử lại với Windows Authentication...');
    // Test 2: Windows Auth
    await testConnection({
      server,
      options: {
        instanceName: instance,
        database,
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 15000,
      },
      authentication: { 
        type: 'ntlm',
        options: { domain: '', userName: '', password: '' }
      }
    }, `Windows Auth: ${server}\\${instance}`);
  }

  console.log('\n' + '='.repeat(60));
  setTimeout(() => process.exit(0), 500);
}

main().catch(e => {
  console.error('Lỗi không xác định:', e.message);
  process.exit(1);
});
