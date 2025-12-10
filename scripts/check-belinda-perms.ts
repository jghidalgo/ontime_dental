import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User';

config({ path: resolve(__dirname, '../.env.local') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = await User.findOne({ email: 'belinda@completedentalsolutions.net' }).lean();
  if (!user) {
    console.log('User not found!');
  } else {
    console.log('Full user object:', JSON.stringify(user, null, 2));
  }
  await mongoose.disconnect();
}
check();
