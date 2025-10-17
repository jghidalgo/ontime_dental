import mongoose from 'mongoose';
import LabCase from '../src/models/LabCase';

const MONGODB_URI = 'mongodb://localhost:27017/ontime_dental';

const labCases = [
  {
    caseId: 'LAB-000001',
    lab: 'Complete Lab',
    clinic: 'Miller Dental - Coral Gables',
    patientFirstName: 'Sarah',
    patientLastName: 'Johnson',
    birthday: '1985-03-15',
    reservationDate: '2025-10-20',
    doctor: 'Dr. Alexis Stone',
    procedure: 'Crown - Anterior',
    status: 'in-production',
    category: 'Crowns & Bridges',
    priority: 'normal',
    shadeGuide: 'A2',
    materialType: 'Layered Zirconia',
    toothNumbers: ['8'],
    estimatedCompletion: '2025-10-25',
    technician: 'Miguel Rodriguez',
    notes: 'Patient prefers natural translucency'
  },
  {
    caseId: 'LAB-000002',
    lab: 'Complete Lab',
    clinic: 'Bayfront Smiles',
    patientFirstName: 'Michael',
    patientLastName: 'Chen',
    birthday: '1978-11-22',
    reservationDate: '2025-10-18',
    doctor: 'Dr. Maya Jensen',
    procedure: 'Implant Crown',
    status: 'in-production',
    category: 'Implant Restorations',
    priority: 'rush',
    shadeGuide: 'B1',
    materialType: 'Titanium Abutment + Zirconia Crown',
    toothNumbers: ['14'],
    estimatedCompletion: '2025-10-23',
    technician: 'Elena Martinez',
    notes: 'Rush case - patient traveling next week'
  },
  {
    caseId: 'LAB-000003',
    lab: 'Complete Lab',
    clinic: 'Sunset Orthodontics',
    patientFirstName: 'Emma',
    patientLastName: 'Rodriguez',
    birthday: '1992-07-08',
    reservationDate: '2025-10-15',
    doctor: 'Dr. Luis Carmona',
    procedure: 'Clear Aligners - Full Arch',
    status: 'in-planning',
    category: 'Aligners & Ortho',
    priority: 'normal',
    materialType: 'Thermoformed Plastic',
    toothNumbers: ['1-16', '17-32'],
    estimatedCompletion: '2025-10-30',
    notes: 'Patient wants expedited Monday production'
  },
  {
    caseId: 'LAB-000004',
    lab: 'Complete Lab',
    clinic: 'Miller Dental - Coral Gables',
    patientFirstName: 'James',
    patientLastName: 'Wilson',
    birthday: '1965-05-30',
    reservationDate: '2025-10-17',
    doctor: 'Dr. Alexis Stone',
    procedure: 'Bridge - 3 Unit',
    status: 'in-transit',
    category: 'Crowns & Bridges',
    priority: 'normal',
    shadeGuide: 'A3',
    materialType: 'PFM (Porcelain Fused to Metal)',
    toothNumbers: ['12', '13', '14'],
    estimatedCompletion: '2025-10-22',
    actualCompletion: '2025-10-22',
    technician: 'Carlos Diaz',
    notes: 'Traditional metal substructure requested by doctor'
  },
  {
    caseId: 'LAB-000005',
    lab: 'Complete Lab',
    clinic: 'Bayfront Smiles',
    patientFirstName: 'Sophie',
    patientLastName: 'Becker',
    birthday: '1988-09-12',
    reservationDate: '2025-10-16',
    doctor: 'Dr. Maya Jensen',
    procedure: 'Try-in Wax Setup',
    status: 'in-production',
    category: 'Try-in / Wax Setups',
    priority: 'urgent',
    toothNumbers: ['7', '8', '9', '10'],
    estimatedCompletion: '2025-10-21',
    technician: 'Sofia Garcia',
    notes: 'Shade confirmation needed before proceeding to final'
  },
  {
    caseId: 'LAB-000006',
    lab: 'Complete Lab',
    clinic: 'Miller Dental - Coral Gables',
    patientFirstName: 'David',
    patientLastName: 'Martinez',
    birthday: '1975-12-05',
    reservationDate: '2025-10-19',
    doctor: 'Dr. Alexis Stone',
    procedure: 'Denture Repair',
    status: 'in-production',
    category: 'Repairs & Adjustments',
    priority: 'rush',
    estimatedCompletion: '2025-10-20',
    technician: 'Miguel Rodriguez',
    notes: 'Same-day repair if possible'
  },
  {
    caseId: 'LAB-000007',
    lab: 'Complete Lab',
    clinic: 'Sunset Orthodontics',
    patientFirstName: 'Isabella',
    patientLastName: 'Garcia',
    birthday: '2008-04-18',
    reservationDate: '2025-10-14',
    doctor: 'Dr. Luis Carmona',
    procedure: 'Retainer Set',
    status: 'completed',
    category: 'Aligners & Ortho',
    priority: 'normal',
    materialType: 'Hawley Retainer',
    toothNumbers: ['1-16', '17-32'],
    estimatedCompletion: '2025-10-18',
    actualCompletion: '2025-10-17',
    technician: 'Ana Lopez',
    notes: 'Early completion - delivered ahead of schedule'
  },
  {
    caseId: 'LAB-000008',
    lab: 'Complete Lab',
    clinic: 'Bayfront Smiles',
    patientFirstName: 'Robert',
    patientLastName: 'Taylor',
    birthday: '1970-08-25',
    reservationDate: '2025-10-21',
    doctor: 'Dr. Maya Jensen',
    procedure: 'Implant Bridge - 4 Unit',
    status: 'in-planning',
    category: 'Implant Restorations',
    priority: 'normal',
    shadeGuide: 'A1',
    materialType: 'Full Zirconia on Ti-Base',
    toothNumbers: ['18', '19', '20', '21'],
    estimatedCompletion: '2025-10-28',
    notes: 'Digital scan submitted - awaiting implant verification'
  },
  {
    caseId: 'LAB-000009',
    lab: 'Complete Lab',
    clinic: 'Miller Dental - Coral Gables',
    patientFirstName: 'Olivia',
    patientLastName: 'Brown',
    birthday: '1995-02-14',
    reservationDate: '2025-10-13',
    doctor: 'Dr. Alexis Stone',
    procedure: 'Veneer - Single',
    status: 'in-transit',
    category: 'Crowns & Bridges',
    priority: 'normal',
    shadeGuide: 'B2',
    materialType: 'E-max',
    toothNumbers: ['9'],
    estimatedCompletion: '2025-10-19',
    actualCompletion: '2025-10-19',
    technician: 'Elena Martinez',
    notes: 'Minimal prep - match adjacent teeth'
  },
  {
    caseId: 'LAB-000010',
    lab: 'Complete Lab',
    clinic: 'Sunset Orthodontics',
    patientFirstName: 'Lucas',
    patientLastName: 'Anderson',
    birthday: '2005-06-30',
    reservationDate: '2025-10-22',
    doctor: 'Dr. Luis Carmona',
    procedure: 'Night Guard',
    status: 'in-planning',
    category: 'Other',
    priority: 'normal',
    materialType: 'Soft Splint Material',
    toothNumbers: ['1-16'],
    estimatedCompletion: '2025-10-26',
    notes: 'Patient grinds teeth - need durable material'
  }
];

async function seedLabCases() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing lab cases
    await LabCase.deleteMany({});
    console.log('Cleared existing lab cases');

    // Insert new lab cases
    const result = await LabCase.insertMany(labCases);
    console.log(`Successfully seeded ${result.length} lab cases`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding lab cases:', error);
    process.exit(1);
  }
}

seedLabCases();
