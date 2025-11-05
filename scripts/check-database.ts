import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', MONGODB_URI?.substring(0, 30) + '...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('✓ Connected to MongoDB\n');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('=== ALL COLLECTIONS ===');
    for (const coll of collections) {
      const count = await mongoose.connection.db.collection(coll.name).countDocuments();
      console.log(`- ${coll.name}: ${count} documents`);
    }
    
    // Check users collection specifically
    console.log('\n=== CHECKING USERS COLLECTION ===');
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`Total users: ${usersCount}`);
    
    if (usersCount > 0) {
      const users = await mongoose.connection.db.collection('users').find({}).limit(5).toArray();
      console.log('\nFirst 5 users:');
      for (const user of users) {
        console.log(`- ${user.name} (${user.email})`);
        console.log(`  Permissions:`, user.permissions);
      }
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
}

checkDatabase().catch(console.error);
