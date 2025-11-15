import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import Employee from '../src/models/Employee';

config({ path: resolve(__dirname, '../.env.local') });

async function checkEmployees() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '', {
      dbName: 'ontime_dental'
    });
    
    console.log('Connected to MongoDB\n');
    
    const count = await Employee.countDocuments();
    console.log(`Total employees: ${count}\n`);
    
    const employees = await Employee.find().select('name position companyId').lean();
    
    console.log('Employees:');
    employees.forEach((emp: any) => {
      console.log(`- ${emp.name} | Position: ${emp.position} | CompanyId: ${emp.companyId || 'NOT SET'}`);
    });
    
    console.log('\n--- Checking for Farid ---');
    const farid = await Employee.findOne({ name: /Farid/i }).lean();
    if (farid) {
      console.log('Found Farid:', JSON.stringify(farid, null, 2));
    } else {
      console.log('Farid not found in database');
    }
    
    console.log('\n--- Checking for Dentists ---');
    const dentists = await Employee.find({ position: /dentist/i }).lean();
    console.log(`Found ${dentists.length} dentists`);
    dentists.forEach((d: any) => {
      console.log(`- ${d.name} | CompanyId: ${d.companyId || 'NOT SET'}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEmployees();
