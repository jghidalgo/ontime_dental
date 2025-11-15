import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import Employee from '../src/models/Employee';
import Company from '../src/models/Company';

config({ path: resolve(__dirname, '../.env.local') });

async function addDentists() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '', {
      dbName: 'ontime_dental'
    });
    
    console.log('Connected to MongoDB\n');
    
    // Get all companies
    const companies = await Company.find().lean();
    console.log('Available companies:');
    companies.forEach((c: any) => {
      console.log(`- ${c.name} (${c.shortName}) - ID: ${c._id}`);
    });
    console.log();
    
    // Find BJDG company
    const bjdgCompany = companies.find((c: any) => c.shortName === 'BJDG');
    const cdsCompany = companies.find((c: any) => c.shortName === 'CDS');
    
    if (!bjdgCompany || !cdsCompany) {
      console.log('Required companies not found');
      await mongoose.connection.close();
      return;
    }
    
    const dentists = [
      {
        employeeId: 'EMP-100',
        name: 'Farid Blanco',
        joined: '01/15/2023',
        dateOfBirth: '03/12/1985',
        phone: '(305) 555-1001',
        position: 'Dentist',
        location: 'Little Havana',
        email: 'farid.blanco@ontimedental.com',
        department: 'Clinical',
        status: 'active',
        companyId: bjdgCompany._id.toString()
      },
      {
        employeeId: 'EMP-101',
        name: 'Dr. Carmen Casas',
        joined: '06/10/2022',
        dateOfBirth: '07/15/1982',
        phone: '(305) 555-1002',
        position: 'Dentist',
        location: 'Tamiami',
        email: 'carmen.casas@ontimedental.com',
        department: 'Clinical',
        status: 'active',
        companyId: bjdgCompany._id.toString()
      },
      {
        employeeId: 'EMP-102',
        name: 'Dr. Ricardo Rivera',
        joined: '03/20/2021',
        dateOfBirth: '09/08/1980',
        phone: '(305) 555-1003',
        position: 'Dentist',
        location: 'Pembroke Pines',
        email: 'ricardo.rivera@ontimedental.com',
        department: 'Clinical',
        status: 'active',
        companyId: cdsCompany._id.toString()
      },
      {
        employeeId: 'EMP-103',
        name: 'Dr. Ana Martinez',
        joined: '08/05/2020',
        dateOfBirth: '11/22/1978',
        phone: '(305) 555-1004',
        position: 'Dentist',
        location: 'Royal Palm',
        email: 'ana.martinez@ontimedental.com',
        department: 'Clinical',
        status: 'active',
        companyId: cdsCompany._id.toString()
      }
    ];
    
    console.log('Adding dentists...\n');
    
    for (const dentist of dentists) {
      // Check if already exists
      const existing = await Employee.findOne({ employeeId: dentist.employeeId });
      if (existing) {
        console.log(`⚠️  ${dentist.name} already exists, skipping...`);
        continue;
      }
      
      const created = await Employee.create(dentist);
      console.log(`✅ Added ${created.name} (${created.position}) - Company: ${dentist.companyId}`);
    }
    
    console.log('\n✅ Done! Dentists have been added.');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addDentists();
