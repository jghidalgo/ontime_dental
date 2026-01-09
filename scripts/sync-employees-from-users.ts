import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local before importing DB helpers.
config({ path: resolve(__dirname, '../.env.local') });

function formatMMDDYYYY(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function safeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function toEmployeeStatus(isActive: unknown): 'active' | 'inactive' {
  return isActive === false ? 'inactive' : 'active';
}

async function main() {
  const [{ connectToDatabase }, { default: User }, { default: Employee }] = await Promise.all([
    import('../src/lib/db'),
    import('../src/models/User'),
    import('../src/models/Employee')
  ]);

  await connectToDatabase();

  const users: any[] = await User.find({}).lean();
  const today = new Date();

  let created = 0;
  let linked = 0;
  let updatedCompany = 0;
  let skipped = 0;

  for (const user of users) {
    const userId = user._id?.toString();
    if (!userId) {
      skipped += 1;
      continue;
    }

    const email = safeString(user.email)?.toLowerCase();
    const companyId = user.companyId ? String(user.companyId) : undefined;

    const existingByUserId = await Employee.findOne({ userId }).select('_id companyId').lean();
    if (existingByUserId) {
      // Ensure companyId is set/consistent when possible
      if (companyId && (!existingByUserId.companyId || String(existingByUserId.companyId) !== companyId)) {
        await Employee.updateOne({ _id: existingByUserId._id }, { $set: { companyId } });
        updatedCompany += 1;
      }
      continue;
    }

    // Try to link an existing employee by email (common case for seeded data)
    if (email) {
      const existingByEmail = await Employee.findOne({ email }).select('_id userId companyId').lean();
      if (existingByEmail && !existingByEmail.userId) {
        await Employee.updateOne(
          { _id: existingByEmail._id },
          {
            $set: {
              userId,
              ...(companyId ? { companyId } : {})
            }
          }
        );
        linked += 1;
        continue;
      }
    }

    const employeeId = `EMP-${userId.slice(-6).toUpperCase()}`;

    await Employee.create({
      employeeId,
      userId,
      companyId: companyId ?? null,
      name: safeString(user.name) ?? (email ? email : 'Employee'),
      joined: formatMMDDYYYY(today),
      dateOfBirth: '01/01/1990',
      phone: safeString(user.phone) ?? '(000) 000-0000',
      position: safeString(user.position) ?? (safeString(user.role) ?? 'Staff'),
      location: safeString(user.department) ?? 'Main Office',
      email: email ?? undefined,
      department: safeString(user.department) ?? 'General',
      status: toEmployeeStatus(user.isActive)
    });

    created += 1;
  }

  // Normalize employee emails to lowercase and backfill companyId from linked users
  const employees: any[] = await Employee.find({}).select('_id email userId companyId').lean();
  for (const emp of employees) {
    const updates: Record<string, unknown> = {};
    if (typeof emp.email === 'string' && emp.email !== emp.email.toLowerCase()) {
      updates.email = emp.email.toLowerCase();
    }

    if (emp.userId && !emp.companyId) {
      const u: any = await User.findById(emp.userId).select('companyId').lean();
      if (u?.companyId) updates.companyId = String(u.companyId);
    }

    if (Object.keys(updates).length > 0) {
      await Employee.updateOne({ _id: emp._id }, { $set: updates });
    }
  }

  console.log('✅ Employee sync complete');
  console.log(`- Users scanned: ${users.length}`);
  console.log(`- Employees created: ${created}`);
  console.log(`- Employees linked by email: ${linked}`);
  console.log(`- Employee companyId updated: ${updatedCompany}`);
  console.log(`- Users skipped (missing id): ${skipped}`);
}

main().catch((err) => {
  console.error('❌ Employee sync failed:', err);
  process.exit(1);
});
