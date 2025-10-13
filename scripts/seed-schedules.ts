import mongoose from 'mongoose';
import FrontDeskSchedule from '../src/models/FrontDeskSchedule';
import DoctorSchedule from '../src/models/DoctorSchedule';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ontime_dental';

const frontDeskData = [
  {
    positionId: 'front-desk',
    clinicId: 'ce',
    employee: { id: 'dagmar', name: 'Dagmar' }
  },
  {
    positionId: 'front-desk',
    clinicId: 'miller',
    employee: { id: 'naomi', name: 'Naomi' }
  },
  {
    positionId: 'assistant-1',
    clinicId: 'ce',
    employee: { id: 'natalia', name: 'Natalia' }
  },
  {
    positionId: 'assistant-1',
    clinicId: 'miller',
    employee: { id: 'dulce', name: 'Dulce' }
  },
  {
    positionId: 'assistant-2',
    clinicId: 'ce',
    employee: { id: 'sofia', name: 'Sofía' }
  },
  {
    positionId: 'assistant-2',
    clinicId: 'miller',
    employee: { id: 'marisol', name: 'Marisol' }
  }
];

const doctorScheduleData = [
  {
    dayId: 'monday',
    clinicId: 'ce',
    doctor: { id: 'jorge-blanco', name: 'Dr. Jorge Blanco', shift: 'AM' }
  },
  {
    dayId: 'monday',
    clinicId: 'miller',
    doctor: { id: 'farid-blanco', name: 'Dr. Farid Blanco', shift: 'PM' }
  },
  {
    dayId: 'tuesday',
    clinicId: 'ce',
    doctor: { id: 'naomi-lee', name: 'Dr. Naomi Lee', shift: 'AM' }
  },
  {
    dayId: 'tuesday',
    clinicId: 'miller',
    doctor: { id: 'david-fernandez', name: 'Dr. David Fernández', shift: 'PM' }
  },
  {
    dayId: 'wednesday',
    clinicId: 'ce',
    doctor: { id: 'javier-crespo', name: 'Dr. Javier Crespo', shift: 'AM' }
  },
  {
    dayId: 'wednesday',
    clinicId: 'miller',
    doctor: { id: 'maria-ponce', name: 'Dr. María Ponce', shift: 'PM' }
  },
  {
    dayId: 'thursday',
    clinicId: 'ce',
    doctor: { id: 'carmen-casas', name: 'Dr. Carmen Casas', shift: 'AM' }
  },
  {
    dayId: 'thursday',
    clinicId: 'miller',
    doctor: { id: 'federico-vargas', name: 'Dr. Federico Vargas', shift: 'PM' }
  },
  {
    dayId: 'friday',
    clinicId: 'ce',
    doctor: { id: 'ricardo-rivera', name: 'Dr. Ricardo Rivera', shift: 'AM' }
  },
  {
    dayId: 'friday',
    clinicId: 'miller',
    doctor: { id: 'andres-ibarra', name: 'Dr. Andrés Ibarra', shift: 'PM' }
  },
  {
    dayId: 'saturday',
    clinicId: 'ce',
    doctor: { id: 'on-call', name: 'On-call Doctor', shift: 'AM' }
  },
  {
    dayId: 'saturday',
    clinicId: 'miller',
    doctor: null
  }
];

async function seedSchedules() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing schedule data...');
    await FrontDeskSchedule.deleteMany({});
    await DoctorSchedule.deleteMany({});
    console.log('✅ Cleared existing data');

    // Seed Front Desk Schedules
    console.log('📋 Seeding front desk schedules...');
    for (const schedule of frontDeskData) {
      await FrontDeskSchedule.create(schedule);
    }
    console.log(`   ✓ Created ${frontDeskData.length} front desk assignments`);

    // Seed Doctor Schedules
    console.log('👨‍⚕️ Seeding doctor schedules...');
    for (const schedule of doctorScheduleData) {
      await DoctorSchedule.create(schedule);
    }
    console.log(`   ✓ Created ${doctorScheduleData.length} doctor assignments`);

    // Summary
    const frontDeskCount = await FrontDeskSchedule.countDocuments();
    const doctorCount = await DoctorSchedule.countDocuments();

    console.log('\n📊 Summary:');
    console.log(`   - Front Desk Schedules: ${frontDeskCount}`);
    console.log(`   - Doctor Schedules: ${doctorCount}`);
    console.log('\n🎉 Schedules seeded successfully!');

    await mongoose.connection.close();
    console.log('👋 Connection closed');
  } catch (error) {
    console.error('❌ Error seeding schedules:', error);
    process.exit(1);
  }
}

seedSchedules();
