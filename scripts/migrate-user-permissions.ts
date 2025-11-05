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

const DEFAULT_PERMISSIONS = {
  modules: [
    'dashboard',
    'documents',
    'contacts',
    'schedules',
    'tickets',
    'laboratory',
    'hr',
    'insurances',
    'complaints',
    'licenses',
    'medication',
    'settings'
  ]
};

async function migrateUserPermissions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('✓ Connected to MongoDB');

    // Update all users that don't have permissions
    const result = await User.updateMany(
      { permissions: { $exists: false } },
      { $set: { permissions: DEFAULT_PERMISSIONS } }
    );

    console.log(`✓ Updated ${result.modifiedCount} users with default permissions`);

    // Show updated users
    const users = await User.find({}, 'name email permissions').lean();
    console.log('\nCurrent users with permissions:');
    for (const user of users) {
      console.log(`- ${user.name} (${user.email}): ${user.permissions?.modules?.length || 0} modules`);
    }

    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
}

migrateUserPermissions().catch(console.error);
