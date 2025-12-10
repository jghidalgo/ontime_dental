import { config } from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../src/models/User';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function fixBelindaPassword() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not defined in .env.local');
  }

  console.log('🔗 Connecting to MongoDB...');
  
  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB ?? 'ontime_dental'
  });

  console.log('✅ Connected to MongoDB');

  // Find Belinda's user
  const belinda = await User.findOne({ email: 'belinda@completedentalsolutions.net' });
  
  if (!belinda) {
    console.log('❌ User not found with email: belinda@completedentalsolutions.net');
    console.log('\n📋 Available users:');
    const allUsers = await User.find({}, 'name email role').limit(20);
    allUsers.forEach(u => {
      console.log(`   - ${u.name} (${u.email}) [${u.role}]`);
    });
    await mongoose.disconnect();
    return;
  }

  console.log('\n👤 Found user:');
  console.log('   Name:', belinda.name);
  console.log('   Email:', belinda.email);
  console.log('   Role:', belinda.role);
  console.log('   Company ID:', belinda.companyId);

  // Hash the password 'password123'
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Update the user's password
  belinda.password = hashedPassword;
  await belinda.save();

  console.log('\n✅ Password updated successfully!');
  console.log('\n🔐 Login Credentials:');
  console.log('   Email: belinda@completedentalsolutions.net');
  console.log('   Password: password123');
  
  await mongoose.disconnect();
  console.log('\n👋 Disconnected from MongoDB');
}

fixBelindaPassword().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
