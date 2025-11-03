import { connectToDatabase } from '../src/lib/db';
import Company from '../src/models/Company';

async function seedCompanies() {
  try {
    await connectToDatabase();
    console.log('Connected to database');

    // Clear existing companies
    await Company.deleteMany({});
    console.log('Cleared existing companies');

    // Create companies
    const companies = [
      {
        name: 'Complete Dental Solutions',
        shortName: 'CDS Florida',
        location: 'Jacksonville, FL',
        address: '1234 Main Street, Suite 100, Jacksonville, FL 32256',
        phone: '(904) 555-0100',
        email: 'info@completedental.com',
        taxId: '12-3456789',
        isActive: true,
      },
      {
        name: 'OnTime Dental Puerto Rico',
        shortName: 'OnTime PR',
        location: 'San Juan, PR',
        address: '567 Condado Avenue, San Juan, PR 00907',
        phone: '(787) 555-0200',
        email: 'info@ontimedental.pr',
        taxId: '66-7891234',
        isActive: true,
      },
      {
        name: 'Smile Care Central',
        shortName: 'SCC',
        location: 'Orlando, FL',
        address: '890 Lake View Boulevard, Orlando, FL 32801',
        phone: '(407) 555-0300',
        email: 'contact@smilecare.com',
        taxId: '98-7654321',
        isActive: true,
      },
      {
        name: 'Dental Health Associates',
        shortName: 'DHA',
        location: 'Miami, FL',
        address: '456 Ocean Drive, Miami, FL 33139',
        phone: '(305) 555-0400',
        email: 'hello@dentalhealth.com',
        taxId: '45-6789012',
        isActive: true,
      },
    ];

    const created = await Company.insertMany(companies);
    console.log(`✅ Created ${created.length} companies successfully!`);

    created.forEach((company) => {
      console.log(`   - ${company.name} (${company.shortName})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding companies:', error);
    process.exit(1);
  }
}

seedCompanies();
