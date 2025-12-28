import { config } from 'dotenv';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import User from '../src/models/User';

config({ path: resolve(__dirname, '../.env.local') });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not defined in .env.local');

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB ?? 'ontime_dental'
  });

  const user = await User.findOne({ role: 'admin', isActive: true }).select('_id email role').lean();
  if (!user) throw new Error('No active admin user found');

  const { createToken } = await import('../src/lib/auth');

  const token = createToken({ sub: String((user as any)._id), email: (user as any).email, role: (user as any).role });

  const endpoint = process.env.TEST_GRAPHQL_URL || 'http://localhost:3001/api/graphql';

  const query = `query TestNotifications($limit: Int) {\n  unreadNotificationCount\n  notifications(unreadOnly: false, limit: $limit, offset: 0) {\n    id\n    title\n    message\n    readAt\n    createdAt\n  }\n}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ query, variables: { limit: 10 } })
  });

  const json = await res.json();
  console.log('HTTP', res.status);
  console.log(JSON.stringify(json, null, 2));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
