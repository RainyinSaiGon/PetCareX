const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let adminToken = '';
let employeeId = '';

// Test statistics
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

async function test(description, fn) {
  testsRun++;
  try {
    await fn();
    testsPassed++;
    console.log(`✅ PASS: ${description}`);
  } catch (error) {
    testsFailed++;
    console.log(`❌ FAIL: ${description}`);
    console.log(`   Error: ${error.message}`);
    if (error.response?.data) {
      console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

async function setup() {
  console.log('\n🔧 Setup: Logging in as admin...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'Admin123!@#'
    });
    adminToken = response.data.access_token;
    console.log('✅ Admin login successful');
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function runTests() {
  console.log('\n📊 ===== PHASE 4: ADMIN MODULES TESTS =====\n');
  
  // ===== 4.1: STAFF MANAGEMENT =====
  console.log('\n📋 4.1: Staff Management Tests\n');
  
  await test('Get all employees', async () => {
    const response = await axios.get(`${BASE_URL}/admin/employees`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!Array.isArray(response.data)) throw new Error('Expected array of employees');
    if (response.data.length > 0) {
      employeeId = response.data[0].MaNhanVien;
      console.log(`   Found ${response.data.length} employees, using MaNhanVien: ${employeeId}`);
    }
  });
  
  await test('Get employee by ID', async () => {
    if (!employeeId) {
      console.log('   Skipped: No employee ID available');
      return;
    }
    const response = await axios.get(`${BASE_URL}/admin/employees/${employeeId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!response.data.MaNhanVien) throw new Error('Employee not found');
    console.log(`   Employee: ${response.data.HoTen || 'N/A'}`);
  });
  
  await test('Update employee salary', async () => {
    if (!employeeId) {
      console.log('   Skipped: No employee ID available');
      return;
    }
    const response = await axios.put(
      `${BASE_URL}/admin/employees/${employeeId}/salary`,
      { newSalary: 15000000 },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!response.data.success) throw new Error('Salary update failed');
    console.log(`   Updated salary successfully`);
  });
  
  // ===== 4.2: ANALYTICS & REPORTS =====
  console.log('\n📊 4.2: Analytics & Reports Tests\n');
  
  await test('Get revenue report (last 30 days)', async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const response = await axios.get(`${BASE_URL}/admin/reports/revenue`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    
    if (!response.data.revenue) throw new Error('Missing revenue data');
    
    console.log(`   Total Revenue: ${response.data.revenue?.total?.toLocaleString() || 0} VND`);
    console.log(`   Product Revenue: ${response.data.revenue?.from_products?.toLocaleString() || 0} VND`);
    console.log(`   Service Revenue: ${response.data.revenue?.from_services?.toLocaleString() || 0} VND`);
  });
  
  await test('Get top services (last 3 months)', async () => {
    const response = await axios.get(`${BASE_URL}/admin/reports/top-services`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { months: 3 }
    });
    
    if (!response.data.top_services) throw new Error('Missing top_services data');
    if (!Array.isArray(response.data.top_services)) throw new Error('Expected array of services');
    
    console.log(`   Found ${response.data.top_services.length} top services`);
    
    if (response.data.top_services.length > 0) {
      const top = response.data.top_services[0];
      console.log(`   Top service: ${top.service_name || 'N/A'} (${top.usage_count} bookings, ${top.total_revenue?.toLocaleString() || 0} VND)`);
    }
  });
  
  await test('Get member tier statistics', async () => {
    const response = await axios.get(`${BASE_URL}/admin/reports/member-tiers`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!response.data.tiers) throw new Error('Missing tiers data');
    if (!Array.isArray(response.data.tiers)) throw new Error('Expected array of tier stats');
    
    console.log(`   Found ${response.data.tiers.length} member tiers`);
    
    response.data.tiers.forEach(tier => {
      console.log(`   Tier ${tier.tier_name}: ${tier.member_count} customers, ${tier.total_spending?.toLocaleString() || 0} VND spent, ${tier.discount_rate}% discount`);
    });
  });
  
  // ===== 4.3: AUTOMATED MEMBER TIER UPDATES =====
  console.log('\n🤖 4.3: Automated Member Tier Updates\n');
  
  await test('Trigger manual member tier update', async () => {
    const response = await axios.post(
      `${BASE_URL}/admin/members/update-tiers`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (typeof response.data.updated !== 'number') throw new Error('Missing update count');
    console.log(`   Updated ${response.data.updated} members`);
    
    if (response.data.details && Array.isArray(response.data.details)) {
      response.data.details.forEach(detail => {
        console.log(`   - ${detail.email}: ${detail.oldTier} → ${detail.newTier} (${detail.spending?.toLocaleString()} VND)`);
      });
    }
  });
  
  // ===== 4.4: DASHBOARD =====
  console.log('\n📈 4.4: Dashboard Summary\n');
  
  await test('Get admin dashboard', async () => {
    const response = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!response.data.totalEmployees) throw new Error('Missing totalEmployees');
    if (!response.data.totalMembers) throw new Error('Missing totalMembers');
    if (!response.data.recentRevenue) throw new Error('Missing recentRevenue');
    if (!response.data.topServices) throw new Error('Missing topServices');
    if (!response.data.memberTiers) throw new Error('Missing memberTiers');
    
    console.log(`   Total Employees: ${response.data.totalEmployees}`);
    console.log(`   Total Members: ${response.data.totalMembers}`);
    console.log(`   Recent Revenue (30d): ${response.data.recentRevenue.totalRevenue?.toLocaleString()} VND`);
    console.log(`   Top Services: ${response.data.topServices.length}`);
    console.log(`   Member Tiers: ${response.data.memberTiers.length}`);
  });
  
  // ===== RBAC VERIFICATION =====
  console.log('\n🔒 RBAC Verification\n');
  
  await test('Non-admin cannot access admin endpoints', async () => {
    try {
      // Login as regular user
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        username: 'authtest2630',
        password: 'TestPass123!@#'
      });
      
      const userToken = loginResponse.data.access_token;
      
      // Try to access admin endpoint
      try {
        await axios.get(`${BASE_URL}/admin/employees`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        throw new Error('Should have been forbidden');
      } catch (error) {
        if (error.response?.status !== 403) {
          throw new Error(`Expected 403, got ${error.response?.status}`);
        }
        console.log('   Correctly denied access with 403 Forbidden');
      }
    } catch (error) {
      if (error.message === 'Should have been forbidden') throw error;
      if (error.message.includes('Expected 403')) throw error;
      // Login failed - user might not exist, skip test
      console.log('   Skipped: Test user not available');
    }
  });
}

async function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testsRun}`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`Success Rate: ${((testsPassed / testsRun) * 100).toFixed(1)}%`);
  console.log('='.repeat(50) + '\n');
  
  if (testsFailed === 0) {
    console.log('🎉 All Phase 4 tests passed! Admin modules are ready.\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
}

async function main() {
  try {
    await setup();
    await runTests();
    await printSummary();
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

main();
