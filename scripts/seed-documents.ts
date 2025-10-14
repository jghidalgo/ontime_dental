import mongoose from 'mongoose';
import DocumentEntity from '../src/models/Document';

const MONGODB_URI = 'mongodb://localhost:27017/ontime_dental';

const documentEntitiesData = [
  {
    entityId: 'blanco-amos-dental-group',
    name: 'Blanco Amos Dental Group',
    groups: [
      {
        id: 'front-desk-forms',
        name: 'Front Desk Forms',
        documents: [
          {
            id: 'FD-142',
            title: 'Patient Welcome Packet (English)',
            version: '2.3',
            date: '05/14/2024',
            description: 'Updated intake checklist and consent signatures.',
            url: '#'
          },
          {
            id: 'FD-143',
            title: 'Patient Welcome Packet (Spanish)',
            version: '2.3',
            date: '05/14/2024',
            description: 'Translated materials for bilingual offices.',
            url: '#'
          },
          {
            id: 'FD-150',
            title: 'Insurance Verification Form',
            version: '1.5',
            date: '03/22/2024',
            description: 'Standard form for verifying patient insurance coverage.',
            url: '#'
          }
        ]
      },
      {
        id: 'hr-forms',
        name: 'Human Resources Forms',
        documents: [
          {
            id: 'HR-209',
            title: 'Time-Off Request Policy',
            version: '1.4',
            date: '01/09/2024',
            description: 'Submission deadlines and approval routing details.',
            url: '#'
          },
          {
            id: 'HR-214',
            title: 'Employee Acknowledgement Form',
            version: '1.0',
            date: '11/22/2023',
            description: 'Signature form for new handbook policies.',
            url: '#'
          },
          {
            id: 'HR-220',
            title: 'Performance Review Template',
            version: '2.1',
            date: '06/30/2024',
            description: 'Annual and quarterly performance evaluation form.',
            url: '#'
          }
        ]
      },
      {
        id: 'clinical-protocols',
        name: 'Clinical Protocols',
        documents: [
          {
            id: 'CP-305',
            title: 'Infection Control Guidelines',
            version: '3.0',
            date: '02/15/2024',
            description: 'Comprehensive sterilization and safety procedures.',
            url: '#'
          },
          {
            id: 'CP-312',
            title: 'Emergency Response Protocol',
            version: '1.9',
            date: '04/10/2024',
            description: 'Step-by-step procedures for medical emergencies.',
            url: '#'
          }
        ]
      }
    ]
  },
  {
    entityId: 'complete-dental-lab',
    name: 'Complete Dental Lab',
    groups: [
      {
        id: 'front-desk-forms',
        name: 'Front Desk Forms',
        documents: [
          {
            id: '747',
            title: 'CCL Package',
            version: '1.0',
            date: '06/25/2020',
            description: 'Compliance checklist for customer onboarding.',
            url: '#'
          },
          {
            id: '940',
            title: 'Visit Records',
            version: '1.0',
            date: '10/20/2019',
            description: 'Template for documenting lab visit outcomes.',
            url: '#'
          },
          {
            id: '950',
            title: 'Lab Order Form',
            version: '2.2',
            date: '07/12/2024',
            description: 'Standardized form for placing lab work orders.',
            url: '#'
          }
        ]
      },
      {
        id: 'compliance',
        name: 'Compliance',
        documents: [
          {
            id: 'CMP-301',
            title: 'OSHA Readiness Binder',
            version: '3.1',
            date: '02/18/2024',
            description: 'Emergency response, sanitation and exposure protocols.',
            url: '#'
          },
          {
            id: 'CMP-305',
            title: 'Quality Assurance Checklist',
            version: '1.7',
            date: '05/05/2024',
            description: 'Standards and verification procedures for lab work.',
            url: '#'
          }
        ]
      },
      {
        id: 'technical-specs',
        name: 'Technical Specifications',
        documents: [
          {
            id: 'TS-410',
            title: 'Material Safety Data Sheets',
            version: '4.0',
            date: '01/20/2024',
            description: 'Safety information for all lab materials.',
            url: '#'
          }
        ]
      }
    ]
  },
  {
    entityId: 'complete-dental-supplies',
    name: 'Complete Dental Supplies',
    groups: [
      {
        id: 'operations',
        name: 'Operations',
        documents: [
          {
            id: 'OPS-410',
            title: 'Vendor Ordering Guide',
            version: '4.6',
            date: '03/02/2024',
            description: 'Quarterly catalog with pricing tiers and freight notes.',
            url: '#'
          },
          {
            id: 'OPS-414',
            title: 'Inventory Count Template',
            version: '2.0',
            date: '08/15/2023',
            description: 'Excel template for cycle counts and variance tracking.',
            url: '#'
          },
          {
            id: 'OPS-420',
            title: 'Shipping & Receiving Procedures',
            version: '1.3',
            date: '09/08/2024',
            description: 'Standard operating procedures for logistics.',
            url: '#'
          }
        ]
      },
      {
        id: 'hr-forms',
        name: 'Human Resources Forms',
        documents: [
          {
            id: 'HR-512',
            title: 'Safety Training Sign-Off',
            version: '1.8',
            date: '04/04/2024',
            description: 'Required acknowledgement for annual safety seminar.',
            url: '#'
          },
          {
            id: 'HR-515',
            title: 'Employee Handbook',
            version: '5.0',
            date: '01/01/2024',
            description: 'Complete guide to company policies and procedures.',
            url: '#'
          }
        ]
      },
      {
        id: 'product-catalog',
        name: 'Product Catalog',
        documents: [
          {
            id: 'PC-600',
            title: '2024 Product Catalog',
            version: '1.0',
            date: '12/15/2023',
            description: 'Complete listing of available dental supplies.',
            url: '#'
          }
        ]
      }
    ]
  }
];

async function seedDocuments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop the entire collection to ensure clean state
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropCollection('documententities').catch(() => {
        console.log('Document entities collection does not exist, creating new one');
      });
    }
    console.log('Cleared existing document entities collection');

    // Insert document entities
    const result = await DocumentEntity.insertMany(documentEntitiesData);
    console.log(`Successfully seeded ${result.length} document entities`);

    // Display summary
    console.log('\n=== Document Entities Summary ===');
    for (const entity of result) {
      const totalGroups = entity.groups.length;
      const totalDocuments = entity.groups.reduce((sum, group) => sum + group.documents.length, 0);
      console.log(`\n${entity.name}:`);
      console.log(`  Entity ID: ${entity.entityId}`);
      console.log(`  Groups: ${totalGroups}`);
      console.log(`  Total Documents: ${totalDocuments}`);
      
      entity.groups.forEach(group => {
        console.log(`    - ${group.name}: ${group.documents.length} documents`);
      });
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding documents:', error);
    process.exit(1);
  }
}

seedDocuments();
