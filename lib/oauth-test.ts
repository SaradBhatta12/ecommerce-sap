/**
 * Test utility for OAuth callback functionality
 * This file helps verify the OAuth callback customization for tenant associations
 */

import dbConnect from './db-connect';
import User from '@/models/user';
// Multi-tenant functionality removed

export async function testOAuthCallback() {
  try {
    await dbConnect();
    
    console.log('=== OAuth Callback Test ===');
    
    // 1. Test admin user creation
    console.log('\n1. Testing admin user creation...');
    const adminUser = await User.findOne({ 
      email: 'admin@example.com',
      role: 'admin' 
    });
    console.log('Admin user:', adminUser ? 'Found' : 'Not found');
    
    // Multi-tenant functionality removed - tenant user associations disabled
    
    // 3. Test Google provider setup
    console.log('\n3. Testing Google OAuth users...');
    const googleUsers = await User.find({ provider: 'google' });
    console.log(`Found ${googleUsers.length} Google OAuth users`);
    
    for (const user of googleUsers) {
      console.log(`  - ${user.email} (${user.role}): ${user.providerId ? 'Has Google UID' : 'Missing Google UID'}`);
    }
    
    // Multi-tenant functionality removed - tenant associations disabled
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('OAuth callback test failed:', error);
    throw error;
  }
}

export async function simulateOAuthLogin(
  email: string,
  name: string
) {
  try {
    await dbConnect();
    
    console.log(`\n=== Simulating OAuth Login for ${email} ===`);
    
    // Simulate the OAuth callback logic
    const googleUid = `google_${Date.now()}`;
    const role = 'admin'; // Multi-tenant functionality removed
    
    // Check if user exists
    let dbUser = await User.findOne({ 
      $or: [
        { providerId: googleUid, provider: 'google' },
        { email }
      ]
    });
    
    if (!dbUser) {
      // Create new user
      const userData: any = {
        name,
        email,
        provider: 'google',
        providerId: googleUid,
        role,
      };
      
      // Multi-tenant functionality removed - tenant associations disabled
      
      dbUser = new User(userData);
      await dbUser.save();
      console.log('✓ Created new user');
      
      // Multi-tenant functionality removed - tenant associations disabled
    } else {
      console.log('✓ User already exists');
    }
    
    console.log('User details:', {
      id: dbUser._id,
      email: dbUser.email,
      role: dbUser.role,
      // tenantId: removed (multi-tenant functionality disabled),
      providerId: dbUser.providerId,
    });
    
    return dbUser;
    
  } catch (error) {
    console.error('OAuth simulation failed:', error);
    throw error;
  }
}

// Test scenarios
export async function runTestScenarios() {
  console.log('=== Running OAuth Test Scenarios ===');
  
  try {
    // Scenario 1: Admin user login
    console.log('\n--- Scenario 1: Admin User Login ---');
    await simulateOAuthLogin('admin@example.com', 'Admin User');
    
    // Scenario 2: Regular user login (multi-tenant functionality removed)
    console.log('\n--- Scenario 2: Regular User Login ---');
    await simulateOAuthLogin('user@example.com', 'Regular User');
    
    // Run final test
    await testOAuthCallback();
    
  } catch (error) {
    console.error('Test scenarios failed:', error);
  }
}
