import { config } from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../src/models/User';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function seedUser() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not defined in .env.local');
  }

  console.log('Connecting to MongoDB...');
  
  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB ?? 'ontime_dental'
  });

  console.log('Connected to MongoDB');

  // Check if user already exists
  const existingUser = await User.findOne({ email: 'admin@ontimedental.com' });
  
  if (existingUser) {
    console.log('User already exists with email: admin@ontimedental.com');
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await User.create({
    name: 'Admin User',
    email: 'admin@ontimedental.com',
    password: hashedPassword,
    role: 'admin'
  });

  console.log('✅ User created successfully!');
  console.log('Email:', user.email);
  console.log('Password: password123');
  console.log('Role:', user.role);
  
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seedUser().catch((error) => {
  console.error('Error seeding user:', error);
  process.exit(1);
});
