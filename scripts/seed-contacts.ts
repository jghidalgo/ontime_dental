import mongoose from 'mongoose';
import DirectoryEntity from '../src/models/DirectoryEntity';
import DirectoryEntry from '../src/models/DirectoryEntry';
import ClinicLocation from '../src/models/ClinicLocation';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ontime_dental';

const directoryData = [
  {
    entityId: 'bluno-james',
    name: 'Bluno James Dental Group',
    entries: {
      corporate: [
        {
          location: 'Coral Gables HQ',
          phone: '(305) 555-1100',
          extension: '1001',
          department: 'Executive Suite',
          employee: 'Damaris Núñez'
        },
        {
          location: 'Coral Gables HQ',
          phone: '(305) 555-1100',
          extension: '1015',
          department: 'Operations',
          employee: 'Kevin Ortega'
        }
      ],
      frontdesk: [
        {
          location: 'CE Miller Front Desk',
          phone: '(305) 555-2002',
          extension: '2002',
          department: 'Reception',
          employee: 'Naomi Chen'
        },
        {
          location: 'CE Miller Front Desk',
          phone: '(305) 555-2003',
          extension: '2003',
          department: 'Patient Liaison',
          employee: 'Isaac Ponce'
        }
      ],
      offices: [
        {
          location: 'CE Coral Gables',
          phone: '(305) 555-3001',
          extension: '3010',
          department: 'Hygiene',
          employee: 'Alexis Stone'
        },
        {
          location: 'Miller Dental',
          phone: '(305) 555-3012',
          extension: '3012',
          department: 'Orthodontics',
          employee: 'Dr. Farid Blanco'
        }
      ]
    }
  },
  {
    entityId: 'ontime-holdings',
    name: 'OnTime Dental Holdings',
    entries: {
      corporate: [
        {
          location: 'San Juan Support Center',
          phone: '(787) 555-4100',
          extension: '4100',
          department: 'Finance',
          employee: 'Maya Rivera'
        },
        {
          location: 'San Juan Support Center',
          phone: '(787) 555-4101',
          extension: '4108',
          department: 'Human Resources',
          employee: 'Carlos Vélez'
        }
      ],
      frontdesk: [
        {
          location: 'Old San Juan Clinic',
          phone: '(787) 555-5200',
          extension: '5202',
          department: 'Reception',
          employee: 'Luz Martínez'
        }
      ],
      offices: [
        {
          location: 'Caguas Specialty',
          phone: '(787) 555-6200',
          extension: '6215',
          department: 'Pediatric Dentistry',
          employee: 'Dr. Elisa Navarro'
        },
        {
          location: 'Bayamón Family Dental',
          phone: '(787) 555-6210',
          extension: '6218',
          department: 'Endodontics',
          employee: 'Dr. Samuel Ortiz'
        }
      ]
    }
  }
];

const clinicLocationsData = [
  {
    companyId: 'ontime-holdings',
    companyName: 'OnTime Dental Holdings',
    headquarters: 'San Juan, PR',
    description: 'Puerto Rico network of clinics delivering community-first dental care with bilingual teams and extended hours.',
    mapCenter: { lat: 18.438555, lng: -66.062911 },
    clinics: [
      {
        clinicId: 'PR-SJ-01',
        name: 'Old San Juan Clinic',
        address: '101 Fortaleza Street Suite 210',
        city: 'San Juan, PR',
        zip: '00901',
        phone: '(787) 555-5200',
        email: 'oldsanjuan@ontimedental.com',
        hours: 'Mon–Fri 8:00a – 6:00p',
        coordinates: { lat: 18.465539, lng: -66.105735 }
      },
      {
        clinicId: 'PR-CG-02',
        name: 'Caguas Specialty Center',
        address: '500 Calle Betances Level 3',
        city: 'Caguas, PR',
        zip: '00725',
        phone: '(787) 555-6200',
        email: 'caguas@ontimedental.com',
        hours: 'Mon–Sat 8:00a – 7:00p',
        coordinates: { lat: 18.233412, lng: -66.039993 }
      },
      {
        clinicId: 'PR-BY-03',
        name: 'Bayamón Family Dental',
        address: '77 Avenida Main Plaza',
        city: 'Bayamón, PR',
        zip: '00956',
        phone: '(787) 555-6210',
        email: 'bayamon@ontimedental.com',
        hours: 'Mon–Fri 9:00a – 5:30p',
        coordinates: { lat: 18.39856, lng: -66.155723 }
      }
    ]
  },
  {
    companyId: 'bluno-james',
    companyName: 'Bluno James Dental Group',
    headquarters: 'Miami, FL',
    description: 'South Florida flagship centers focused on cosmetic and specialty dentistry with concierge teams.',
    mapCenter: { lat: 25.761681, lng: -80.191788 },
    clinics: [
      {
        clinicId: 'FL-MIA-01',
        name: 'Coral Gables Flagship',
        address: '120 Miracle Mile Suite 500',
        city: 'Coral Gables, FL',
        zip: '33134',
        phone: '(305) 555-1100',
        email: 'coralgables@blunojames.com',
        hours: 'Mon–Sat 8:00a – 6:00p',
        coordinates: { lat: 25.750145, lng: -80.263724 }
      },
      {
        clinicId: 'FL-MIA-02',
        name: 'Miller Dental Studio',
        address: '8455 SW 72nd Street Suite 210',
        city: 'Miami, FL',
        zip: '33143',
        phone: '(305) 555-3012',
        email: 'miller@blunojames.com',
        hours: 'Mon–Fri 8:00a – 5:00p',
        coordinates: { lat: 25.701531, lng: -80.323273 }
      },
      {
        clinicId: 'FL-MIA-03',
        name: 'Biscayne Pediatric Loft',
        address: '3101 NE 7th Avenue Level 9',
        city: 'Miami, FL',
        zip: '33137',
        phone: '(305) 555-3077',
        email: 'biscayne@blunojames.com',
        hours: 'Mon–Sat 9:00a – 5:00p',
        coordinates: { lat: 25.806173, lng: -80.185837 }
      }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: 'ontime_dental'
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await DirectoryEntity.deleteMany({});
    await DirectoryEntry.deleteMany({});
    await ClinicLocation.deleteMany({});
    console.log('✅ Cleared existing data');

    // Seed Directory Entities and Entries
    console.log('📝 Seeding directory data...');
    for (const data of directoryData) {
      // Create entity
      await DirectoryEntity.create({
        entityId: data.entityId,
        name: data.name
      });
      console.log(`   ✓ Created entity: ${data.name}`);

      // Create entries for each group
      for (const group of ['corporate', 'frontdesk', 'offices'] as const) {
        const entries = data.entries[group];
        for (const entry of entries) {
          await DirectoryEntry.create({
            entityId: data.entityId,
            group,
            ...entry
          });
        }
        console.log(`   ✓ Created ${entries.length} ${group} entries`);
      }
    }
    console.log('✅ Directory data seeded successfully');

    // Seed Clinic Locations
    console.log('📍 Seeding clinic locations...');
    for (const location of clinicLocationsData) {
      await ClinicLocation.create(location);
      console.log(`   ✓ Created clinic location: ${location.companyName} (${location.clinics.length} clinics)`);
    }
    console.log('✅ Clinic locations seeded successfully');

    // Summary
    const entityCount = await DirectoryEntity.countDocuments();
    const entryCount = await DirectoryEntry.countDocuments();
    const clinicLocationCount = await ClinicLocation.countDocuments();

    console.log('\n📊 Summary:');
    console.log(`   - Directory Entities: ${entityCount}`);
    console.log(`   - Directory Entries: ${entryCount}`);
    console.log(`   - Clinic Locations: ${clinicLocationCount}`);
    console.log('\n🎉 Database seeded successfully!');

    await mongoose.connection.close();
    console.log('👋 Connection closed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
