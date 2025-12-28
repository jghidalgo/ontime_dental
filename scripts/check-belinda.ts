import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User';
import Employee from '../src/models/Employee';
import Company from '../src/models/Company';

config({ path: resolve(__dirname, '../.env.local') });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not defined in .env.local');

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB ?? 'ontime_dental'
  });

  const company = await Company.findOne({ name: /complete dental solutions/i }).lean();
  console.log('Company (Complete Dental Solutions):');
  console.log(company ? { id: String(company._id), name: company.name, shortName: company.shortName } : 'NOT FOUND');

  const users = await User.find({
    $or: [
      { email: /belinda/i },
      { name: /belinda/i },
      { email: /completedentalsolutions/i }
    ]
  })
    .select('name email role companyId')
    .lean();

  console.log('\nMatching users (belinda/completedentalsolutions):', users.length);
  for (const u of users) {
    console.log({ id: String((u as any)._id), name: (u as any).name, email: (u as any).email, role: (u as any).role, companyId: (u as any).companyId });
  }

  const employeesByName = await Employee.find({ name: /belinda/i })
    .select('name position location status companyId employeeId')
    .lean();

  console.log('\nMatching employees by name (belinda):', employeesByName.length);
  for (const e of employeesByName) {
    console.log({ id: String((e as any)._id), employeeId: (e as any).employeeId, name: (e as any).name, position: (e as any).position, location: (e as any).location, status: (e as any).status, companyId: (e as any).companyId });
  }

  const dentists = await Employee.find({ position: /dentist/i })
    .select('name position location status companyId employeeId')
    .limit(50)
    .lean();

  console.log('\nDentists (first 50):', dentists.length);
  for (const e of dentists) {
    console.log({ employeeId: (e as any).employeeId, name: (e as any).name, location: (e as any).location, status: (e as any).status, companyId: (e as any).companyId ?? 'NOT SET' });
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
