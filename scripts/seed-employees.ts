import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import Employee from '../src/models/Employee';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const employees = [
  {
    employeeId: 'EMP-001',
    name: 'Ariel Gonzalez',
    joined: '02/15/2019',
    dateOfBirth: '09/22/1988',
    phone: '(786) 712-2643',
    position: 'Hygienist',
    location: 'Little Havana',
    email: 'ariel.gonzalez@ontimedental.com',
    department: 'Clinical',
    status: 'active'
  },
  {
    employeeId: 'EMP-002',
    name: 'Dania Rojas',
    joined: '11/03/2021',
    dateOfBirth: '08/07/1990',
    phone: '(786) 723-5386',
    position: '3D Milling',
    location: 'Pembroke Pines',
    email: 'dania.rojas@ontimedental.com',
    department: 'Laboratory',
    status: 'active'
  },
  {
    employeeId: 'EMP-003',
    name: 'Dulce Mejia',
    joined: '07/18/2022',
    dateOfBirth: '05/03/1994',
    phone: '(786) 620-7683',
    position: 'Lab Tech',
    location: 'Tamami',
    email: 'dulce.mejia@ontimedental.com',
    department: 'Laboratory',
    status: 'active'
  },
  {
    employeeId: 'EMP-004',
    name: 'Jaime Fernandez',
    joined: '04/02/2020',
    dateOfBirth: '11/09/1987',
    phone: '(786) 712-4421',
    position: 'Front Desk',
    location: 'Tamami',
    email: 'jaime.fernandez@ontimedental.com',
    department: 'Operations',
    status: 'active'
  },
  {
    employeeId: 'EMP-005',
    name: 'Maria Flores',
    joined: '12/11/2023',
    dateOfBirth: '01/27/1996',
    phone: '(786) 731-9823',
    position: 'Billing Specialist',
    location: 'Pembroke Pines',
    email: 'maria.flores@ontimedental.com',
    department: 'Finance',
    status: 'active'
  },
  {
    employeeId: 'EMP-006',
    name: 'Isabel Rodriguez',
    joined: '03/25/2018',
    dateOfBirth: '06/17/1984',
    phone: '(305) 442-7612',
    position: 'Practice Manager',
    location: 'Little Havana',
    email: 'isabel.rodriguez@ontimedental.com',
    department: 'Management',
    status: 'active'
  },
  {
    employeeId: 'EMP-007',
    name: 'Marco Salazar',
    joined: '10/09/2017',
    dateOfBirth: '09/03/1980',
    phone: '(305) 456-2134',
    position: 'Operations Director',
    location: 'Corporate',
    email: 'marco.salazar@ontimedental.com',
    department: 'Management',
    status: 'active'
  },
  {
    employeeId: 'EMP-008',
    name: 'Naira Gutierrez',
    joined: '05/14/2020',
    dateOfBirth: '04/19/1992',
    phone: '(786) 745-3312',
    position: 'Dental Assistant',
    location: 'Pembroke Pines',
    email: 'naira.gutierrez@ontimedental.com',
    department: 'Clinical',
    status: 'active'
  },
  {
    employeeId: 'EMP-009',
    name: 'Marina Perez',
    joined: '01/05/2016',
    dateOfBirth: '12/31/1985',
    phone: '(305) 890-3321',
    position: 'Office Manager',
    location: 'Tamami',
    email: 'marina.perez@ontimedental.com',
    department: 'Operations',
    status: 'active'
  },
  {
    employeeId: 'EMP-010',
    name: 'Nelson Ochoa',
    joined: '08/12/2015',
    dateOfBirth: '03/22/1978',
    phone: '(786) 321-7763',
    position: 'Lead Technician',
    location: 'Lab',
    email: 'nelson.ochoa@ontimedental.com',
    department: 'Laboratory',
    status: 'active'
  },
  {
    employeeId: 'EMP-011',
    name: 'Mayra Santos',
    joined: '06/23/2022',
    dateOfBirth: '07/01/1993',
    phone: '(954) 221-4563',
    position: 'Recruiter',
    location: 'Corporate',
    email: 'mayra.santos@ontimedental.com',
    department: 'HR',
    status: 'active'
  },
  {
    employeeId: 'EMP-012',
    name: 'Antonio Vega',
    joined: '09/02/2020',
    dateOfBirth: '11/04/1989',
    phone: '(786) 621-0043',
    position: 'Supply Coordinator',
    location: 'Little Havana',
    email: 'antonio.vega@ontimedental.com',
    department: 'Operations',
    status: 'active'
  },
  {
    employeeId: 'EMP-013',
    name: 'Camila Duarte',
    joined: '02/18/2021',
    dateOfBirth: '10/11/1991',
    phone: '(305) 442-1098',
    position: 'Benefits Specialist',
    location: 'Corporate',
    email: 'camila.duarte@ontimedental.com',
    department: 'HR',
    status: 'active'
  },
  {
    employeeId: 'EMP-014',
    name: 'Jorge Castillo',
    joined: '03/10/2014',
    dateOfBirth: '01/09/1975',
    phone: '(786) 773-2109',
    position: 'Facilities Manager',
    location: 'Tamami',
    email: 'jorge.castillo@ontimedental.com',
    department: 'Operations',
    status: 'active'
  },
  {
    employeeId: 'EMP-015',
    name: 'Liliana Paredes',
    joined: '11/28/2018',
    dateOfBirth: '02/12/1986',
    phone: '(954) 833-9987',
    position: 'Insurance Coordinator',
    location: 'Pembroke Pines',
    email: 'liliana.paredes@ontimedental.com',
    department: 'Finance',
    status: 'active'
  },
  {
    employeeId: 'EMP-016',
    name: 'Orlando Peres',
    joined: '09/09/2019',
    dateOfBirth: '06/21/1982',
    phone: '(786) 665-0987',
    position: 'Finance Analyst',
    location: 'Corporate',
    email: 'orlando.peres@ontimedental.com',
    department: 'Finance',
    status: 'active'
  },
  {
    employeeId: 'EMP-017',
    name: 'Patricia Lewis',
    joined: '07/30/2016',
    dateOfBirth: '04/30/1984',
    phone: '(305) 214-1121',
    position: 'Compliance Lead',
    location: 'Corporate',
    email: 'patricia.lewis@ontimedental.com',
    department: 'Compliance',
    status: 'active'
  },
  {
    employeeId: 'EMP-018',
    name: 'Quincy Howard',
    joined: '05/04/2023',
    dateOfBirth: '05/29/1995',
    phone: '(786) 454-3345',
    position: 'Front Desk',
    location: 'Little Havana',
    email: 'quincy.howard@ontimedental.com',
    department: 'Operations',
    status: 'active'
  },
  {
    employeeId: 'EMP-019',
    name: 'Rocio Navarro',
    joined: '10/22/2019',
    dateOfBirth: '09/13/1987',
    phone: '(786) 201-9764',
    position: 'Hygienist',
    location: 'Pembroke Pines',
    email: 'rocio.navarro@ontimedental.com',
    department: 'Clinical',
    status: 'active'
  },
  {
    employeeId: 'EMP-020',
    name: 'Santiago Alvarez',
    joined: '01/18/2015',
    dateOfBirth: '07/02/1981',
    phone: '(305) 890-7765',
    position: 'Lab Supervisor',
    location: 'Lab',
    email: 'santiago.alvarez@ontimedental.com',
    department: 'Laboratory',
    status: 'active'
  },
  {
    employeeId: 'EMP-021',
    name: 'Tatiana Ortiz',
    joined: '12/07/2021',
    dateOfBirth: '10/18/1992',
    phone: '(786) 478-0921',
    position: 'Dental Assistant',
    location: 'Tamami',
    email: 'tatiana.ortiz@ontimedental.com',
    department: 'Clinical',
    status: 'active'
  }
];

async function seedEmployees() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not defined in .env.local');
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB ?? 'ontime_dental'
    });
    
    console.log('Clearing existing employees...');
    await Employee.deleteMany({});
    
    console.log('Creating employees...');
    const createdEmployees = await Employee.insertMany(employees);
    
    console.log(`✅ Successfully seeded ${createdEmployees.length} employees`);
    console.log('\nSample employees:');
    for (const emp of createdEmployees.slice(0, 3)) {
      console.log(`  - ${emp.employeeId}: ${emp.name} (${emp.position} at ${emp.location})`);
    }
    
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding employees:', error);
    process.exit(1);
  }
}

seedEmployees();
