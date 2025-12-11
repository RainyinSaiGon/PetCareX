const { createConnection } = require('typeorm');
require('dotenv').config();

async function checkUsers() {
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'postgres',
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  console.log('\n📊 User Accounts in Database:\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════');

  const users = await connection.query(`
    SELECT 
      id, 
      username, 
      email, 
      full_name, 
      role, 
      is_active, 
      status,
      created_at, 
      last_login 
    FROM "users" 
    ORDER BY created_at DESC
  `);

  if (users.length === 0) {
    console.log('No users found in database');
  } else {
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User ID: ${user.id}`);
      console.log(`   Username:    ${user.username}`);
      console.log(`   Email:       ${user.email}`);
      console.log(`   Full Name:   ${user.full_name || 'N/A'}`);
      console.log(`   Role:        ${user.role}`);
      console.log(`   Status:      ${user.status} (Active: ${user.is_active})`);
      console.log(`   Created:     ${user.created_at}`);
      console.log(`   Last Login:  ${user.last_login || 'Never'}`);
      console.log('   ───────────────────────────────────────────────────────────────────────────');
    });
    console.log(`\nTotal users: ${users.length}`);
  }

  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  await connection.close();
}

checkUsers().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
