const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function createAdminUser() {
  console.log('🔧 Creating admin user...\n');
  
  try {
    // Register a new admin user
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'admin',
      email: 'admin@petcarex.com',
      password: 'Admin123!@#',
      full_name: 'System Administrator',
      role: 'ADMIN'
    });
    
    console.log('✅ Admin user created successfully!');
    console.log(`   Username: admin`);
    console.log(`   Email: admin@petcarex.com`);
    console.log(`   Password: Admin123!@#`);
    console.log(`   Role: ADMIN\n`);
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('đã tồn tại')) {
      console.log('ℹ️  Admin user already exists');
      console.log(`   Username: admin`);
      console.log(`   Password: Admin123!@#\n`);
    } else {
      console.error('❌ Failed to create admin user:', error.response?.data || error.message);
      process.exit(1);
    }
  }
}

createAdminUser();
