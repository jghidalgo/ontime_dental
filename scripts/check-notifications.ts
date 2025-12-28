import { config } from 'dotenv';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import Notification from '../src/models/Notification';
import User from '../src/models/User';

config({ path: resolve(__dirname, '../.env.local') });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not defined in .env.local');

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB ?? 'ontime_dental'
  });

  const total = await Notification.countDocuments({});
  const unread = await Notification.countDocuments({ readAt: null });

  const approvers = await User.find({
    role: { $in: ['admin', 'manager'] },
    isActive: true
  })
    .select('_id email role companyId isActive')
    .sort({ role: 1, email: 1 })
    .lean();

  console.log('Notifications:');
  console.log({ total, unread });

  console.log('\nApprovers (admin/manager users):', approvers.length);
  for (const u of approvers) {
    console.log({
      id: String((u as any)._id),
      email: (u as any).email,
      role: (u as any).role,
      companyId: (u as any).companyId ?? null
    });
  }

  const recent = await Notification.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .select('userId companyId title readAt createdAt')
    .lean();

  console.log('\nRecent notifications (last 10):');
  for (const n of recent) {
    console.log({
      id: String((n as any)._id),
      userId: (n as any).userId,
      companyId: (n as any).companyId ?? null,
      title: (n as any).title,
      readAt: (n as any).readAt ? new Date((n as any).readAt).toISOString() : null,
      createdAt: (n as any).createdAt ? new Date((n as any).createdAt).toISOString() : null
    });
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
