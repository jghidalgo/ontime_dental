import { connectToDatabase } from '../src/lib/db';
import User from '../src/models/User';
import Company from '../src/models/Company';

try {
  await connectToDatabase();
  console.log('Connected to database');

  // Get companies to assign users to them
  const companies = await Company.find();
  if (companies.length === 0) {
    console.log('No companies found. Please run seed-companies.ts first.');
    process.exit(1);
  }

  // Clear existing users (except keep one admin)
  const adminEmail = 'admin@ontimedental.com';
  await User.deleteMany({ email: { $ne: adminEmail } });
  console.log('Cleared existing users (kept admin)');

    // Create sample users for each company
    const usersToCreate = [
      // Complete Dental Solutions (CDS Florida) - First company
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@cds.com',
        password: 'password123', // In production, this should be hashed
        role: 'dentist',
        companyId: companies[0]?._id.toString(),
        phone: '(904) 555-0101',
        position: 'Senior Dentist',
        department: 'Clinical',
        isActive: true,
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@cds.com',
        password: 'password123',
        role: 'manager',
        companyId: companies[0]?._id.toString(),
        phone: '(904) 555-0102',
        position: 'Operations Manager',
        department: 'Administration',
        isActive: true,
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@cds.com',
        password: 'password123',
        role: 'hygienist',
        companyId: companies[0]?._id.toString(),
        phone: '(904) 555-0103',
        position: 'Lead Hygienist',
        department: 'Clinical',
        isActive: true,
      },
      {
        name: 'James Wilson',
        email: 'james.wilson@cds.com',
        password: 'password123',
        role: 'receptionist',
        companyId: companies[0]?._id.toString(),
        phone: '(904) 555-0104',
        position: 'Front Desk Coordinator',
        department: 'Reception',
        isActive: true,
      },

      // OnTime Dental Puerto Rico - Second company
      {
        name: 'Dr. Maria Santos',
        email: 'maria.santos@ontime.pr',
        password: 'password123',
        role: 'dentist',
        companyId: companies[1]?._id.toString(),
        phone: '(787) 555-0201',
        position: 'Chief Dentist',
        department: 'Clinical',
        isActive: true,
      },
      {
        name: 'Carlos Rivera',
        email: 'carlos.rivera@ontime.pr',
        password: 'password123',
        role: 'assistant',
        companyId: companies[1]?._id.toString(),
        phone: '(787) 555-0202',
        position: 'Dental Assistant',
        department: 'Clinical',
        isActive: true,
      },
      {
        name: 'Ana Lopez',
        email: 'ana.lopez@ontime.pr',
        password: 'password123',
        role: 'receptionist',
        companyId: companies[1]?._id.toString(),
        phone: '(787) 555-0203',
        position: 'Receptionist',
        department: 'Reception',
        isActive: true,
      },

      // Smile Care Central - Third company
      {
        name: 'Dr. Robert Taylor',
        email: 'robert.taylor@smilecare.com',
        password: 'password123',
        role: 'dentist',
        companyId: companies[2]?._id.toString(),
        phone: '(407) 555-0301',
        position: 'Dentist',
        department: 'Clinical',
        isActive: true,
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@smilecare.com',
        password: 'password123',
        role: 'hygienist',
        companyId: companies[2]?._id.toString(),
        phone: '(407) 555-0302',
        position: 'Hygienist',
        department: 'Clinical',
        isActive: true,
      },

      // Dental Health Associates - Fourth company
      {
        name: 'Dr. David Martinez',
        email: 'david.martinez@dha.com',
        password: 'password123',
        role: 'dentist',
        companyId: companies[3]?._id.toString(),
        phone: '(305) 555-0401',
        position: 'Senior Dentist',
        department: 'Clinical',
        isActive: true,
      },
      {
        name: 'Jessica Brown',
        email: 'jessica.brown@dha.com',
        password: 'password123',
        role: 'lab_tech',
        companyId: companies[3]?._id.toString(),
        phone: '(305) 555-0402',
        position: 'Lab Technician',
        department: 'Laboratory',
        isActive: true,
      },

      // Global users (not assigned to specific company)
      {
        name: 'System Administrator',
        email: 'sysadmin@ontimedental.com',
        password: 'password123',
        role: 'admin',
        phone: '(888) 555-0000',
        position: 'System Administrator',
        department: 'IT',
        isActive: true,
      },
    ];

    // Insert users
    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Display summary
    console.log('\nUsers created:');
    for (const user of createdUsers) {
      const company = companies.find(c => c._id.toString() === user.companyId);
      console.log(`  - ${user.name} (${user.role}) - ${company?.shortName || 'Global'}`);
    }

  console.log('\n✅ User seeding completed successfully!');
  console.log('\nNote: All users have password "password123" for testing purposes.');
  console.log('In production, ensure passwords are properly hashed!');

  process.exit(0);
} catch (error) {
  console.error('Error seeding users:', error);
  process.exit(1);
}
