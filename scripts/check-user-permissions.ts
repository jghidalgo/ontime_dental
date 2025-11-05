import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function checkUserPermissions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('✓ Connected to MongoDB\n');

    // Find all users and display their permissions
    const users = await User.find({}, 'name email permissions').lean();
    
    console.log('=== ALL USERS AND THEIR PERMISSIONS ===\n');
    
    for (const user of users) {
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Permissions:`, user.permissions);
      if (user.permissions?.modules) {
        console.log(`  Modules (${user.permissions.modules.length}):`, user.permissions.modules.join(', '));
      } else {
        console.log(`  ⚠️  NO PERMISSIONS DEFINED`);
      }
      console.log('');
    }
    
    console.log('=== SUMMARY ===');
    console.log(`Total users: ${users.length}`);
    const usersWithPermissions = users.filter(u => u.permissions?.modules?.length);
    console.log(`Users with permissions: ${usersWithPermissions.length}`);
    console.log(`Users without permissions: ${users.length - usersWithPermissions.length}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
}

checkUserPermissions().catch(console.error);
