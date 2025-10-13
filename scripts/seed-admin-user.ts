import mongoose from 'mongoose';
import User from '../src/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ontime_dental';

async function seedAdminUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: 'ontime_dental'
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: 'admin@ontimedental.com' });
    
    if (existingUser) {
      console.log('ℹ️  Admin user already exists');
      console.log('   Email:', existingUser.email);
      console.log('   Name:', existingUser.name);
      console.log('   Role:', existingUser.role);
      await mongoose.connection.close();
      console.log('👋 Connection closed');
      return;
    }

    // Create the admin user with pre-hashed password
    console.log('📝 Creating admin user...');
    const adminUser = await User.create({
      _id: new mongoose.Types.ObjectId('68e71ced1f64e759e92f81e0'),
      name: 'Admin User',
      email: 'admin@ontimedental.com',
      password: '$2a$10$ayhEFePuqueSSSuaVCtDqOTd36fsqZE1AiHggvkKiATJgkhQUpaDK', // Pre-hashed password
      role: 'admin',
      createdAt: new Date('2025-10-09T02:24:45.208Z'),
      updatedAt: new Date('2025-10-09T02:24:45.208Z')
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📊 User Details:');
    console.log('   ID:', adminUser._id);
    console.log('   Name:', adminUser.name);
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);
    console.log('\n🔐 Login Credentials:');
    console.log('   Email: admin@ontimedental.com');
    console.log('   Password: [Your original password - the hash provided]');
    console.log('\n🎉 You can now login with this user!');

    await mongoose.connection.close();
    console.log('👋 Connection closed');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdminUser();
