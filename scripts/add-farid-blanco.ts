import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import Employee from '../src/models/Employee';
import Company from '../src/models/Company';

config({ path: resolve(__dirname, '../.env.local') });

async function addFaridBlanco() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '', {
      dbName: 'ontime_dental'
    });
    
    console.log('Connected to MongoDB\n');
    
    // Find BJDG company
    const bjdgCompany = await Company.findOne({ shortName: 'BJDG' }).lean();
    
    if (!bjdgCompany) {
      console.log('BJDG company not found. Available companies:');
      const companies = await Company.find().select('name shortName').lean();
      companies.forEach((c: any) => {
        console.log(`- ${c.name} (${c.shortName}) - ID: ${c._id}`);
      });
      await mongoose.connection.close();
      return;
    }
    
    console.log(`Found BJDG company: ${bjdgCompany._id}\n`);
    
    // Check if Farid already exists
    const existing = await Employee.findOne({ name: /Farid.*Blanco/i });
    if (existing) {
      console.log('Farid Blanco already exists:', existing);
      await mongoose.connection.close();
      return;
    }
    
    // Create Farid Blanco as a Dentist
    const farid = await Employee.create({
      employeeId: 'EMP-023',
      name: 'Farid Blanco',
      joined: '01/15/2023',
      dateOfBirth: '03/12/1985',
      phone: '(305) 555-1234',
      position: 'Dentist',
      location: 'Little Havana',
      email: 'farid.blanco@ontimedental.com',
      department: 'Clinical',
      status: 'active',
      companyId: bjdgCompany._id.toString()
    });
    
    console.log('✅ Successfully created Farid Blanco:');
    console.log(`- ID: ${farid._id}`);
    console.log(`- Employee ID: ${farid.employeeId}`);
    console.log(`- Name: ${farid.name}`);
    console.log(`- Position: ${farid.position}`);
    console.log(`- Company ID: ${farid.companyId}`);
    console.log(`- Location: ${farid.location}`);
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addFaridBlanco();
