# Company-Based Data Filtering Implementation Guide

## Overview
This guide documents the changes made to implement company-based data filtering across all modules in the OnTime Dental application.

## ✅ COMPLETED: Models Updated

All MongoDB models now include `companyId` field with proper indexing:

### Updated Models:
1. **DirectoryEntity** - Added companyId (required), indexed
2. **DirectoryEntry** - Added companyId (required), compound indexes with entityId and group
3. **FrontDeskSchedule** - Added companyId (required), compound unique index with positionId and clinicId
4. **DoctorSchedule** - Added companyId (required), compound unique index with dayId and clinicId
5. **Ticket** - Added companyId (required), compound indexes with status and priority
6. **LabCase** - Added companyId (required), indexes with status and reservationDate
7. **Document (DocumentEntity)** - Added companyId (required), indexed
8. **Employee** - Added companyId (required), compound indexes with status, location, position

Note: **ClinicLocation** already had companyId as it was designed with company association from the start.

## ✅ COMPLETED: GraphQL Schema Updated

### Type Definitions:
- All types now include `companyId: String!` field
- All input types include `companyId: String!` for creation
- All queries accept optional `companyId: ID` parameter for filtering
- All mutations accept `companyId` where applicable

### Key Changes:
```graphql
# Example Query Changes
directoryEntities(companyId: ID): [DirectoryEntity!]!
tickets(companyId: ID): [Ticket!]!
labCases(companyId: ID): [LabCase!]!
employees(companyId: ID, ...): [Employee!]!

# Example Mutation Changes
createTicket(input: TicketInput!): Ticket!  # TicketInput now includes companyId
createLabCase(input: LabCaseInput!): LabCase!  # LabCaseInput now includes companyId
```

## 🔄 IN PROGRESS: Resolvers Update

### Pattern for Updating Queries:
```typescript
// OLD
someQuery: async () => {
  await connectToDatabase();
  const items = await Model.find().lean();
  return items.map((item: any) => ({ ...item, id: item._id.toString() }));
},

// NEW
someQuery: async (_: unknown, { companyId }: { companyId?: string }) => {
  await connectToDatabase();
  const filter = companyId ? { companyId } : {};
  const items = await Model.find(filter).lean();
  return items.map((item: any) => ({
    ...item,
    id: item._id.toString()
  }));
},
```

### Resolvers to Update:

#### Directory Resolvers:
- `directoryEntities` - Filter by companyId
- `directoryEntity` - Add companyId to filter
- `directoryEntriesByEntity` - Add companyId to filter
- `directoryEntityWithEntries` - Filter entity and entries by companyId
- `allDirectoryData` - Filter by companyId
- `createDirectoryEntity` - Accept companyId parameter
- `createDirectoryEntry` - Ensure companyId in input
- `reorderDirectoryEntries` - Filter by companyId

#### Schedule Resolvers:
- `frontDeskSchedules` - Filter by companyId
- `doctorSchedules` - Filter by companyId
- `updateFrontDeskSchedule` - Add companyId parameter
- `updateDoctorSchedule` - Add companyId parameter
- `swapFrontDeskAssignments` - Add companyId parameter, filter swaps
- `swapDoctorAssignments` - Add companyId parameter, filter swaps

#### Ticket Resolvers:
- `tickets` - Filter by companyId
- `ticket` - No change (get by ID)
- `createTicket` - Ensure companyId in input
- `updateTicket` - Ensure companyId in input
- `deleteTicket` - No change

#### Document Resolvers:
- `documentEntities` - Filter by companyId
- `documentEntity` - Add companyId to filter
- `createDocumentEntity` - Accept companyId parameter
- `updateDocumentEntity` - Add companyId filter
- `deleteDocumentEntity` - Add companyId filter
- `addDocumentGroup` - Add companyId filter
- `updateDocumentGroup` - Add companyId filter
- `deleteDocumentGroup` - Add companyId filter
- `addDocument` - Add companyId filter
- `updateDocument` - Add companyId filter
- `deleteDocument` - Add companyId filter

#### Lab Case Resolvers:
- `labCases` - Filter by companyId
- `labCase` - No change (get by ID)
- `labCaseByNumber` - Add companyId to filter
- `createLabCase` - Ensure companyId in input
- `updateLabCase` - No change (updates by ID)
- `deleteLabCase` - No change

#### Employee Resolvers:
- `employees` - Filter by companyId (add to existing filters)
- `employee` - No change (get by ID)
- `employeeByEmployeeId` - Add companyId to filter
- `createEmployee` - Ensure companyId in input
- `updateEmployee` - Allow companyId update in input
- `deleteEmployee` - No change

## ⏳ TODO: Seed Scripts Update

All seed scripts need to be updated to assign `companyId` to data:

### Scripts to Update:
1. `seed-contacts.ts` (DirectoryEntity/DirectoryEntry)
2. `seed-schedules.ts` (FrontDeskSchedule/DoctorSchedule)
3. `seed-tickets.ts` (Ticket)
4. `seed-documents.ts` (DocumentEntity)
5. `seed-lab-cases.ts` (LabCase)
6. `seed-employees.ts` (Employee - different from seed-users.ts)

### Pattern:
```typescript
// Get first company
const companies = await Company.find();
const defaultCompanyId = companies[0]?._id.toString();

// When creating records
await Model.create({
  ...existingFields,
  companyId: defaultCompanyId
});
```

## ⏳ TODO: Frontend Queries Update

All page components need to pass `selectedEntityId` (companyId) to queries:

### Pattern:
```typescript
// OLD
const { data } = useQuery(GET_ITEMS);

// NEW
const { data } = useQuery(GET_ITEMS, {
  variables: { companyId: selectedEntityId },
  skip: !selectedEntityId  // Don't query until company is selected
});
```

### Pages to Update:
1. **Dashboard** (`src/app/dashboard/page.tsx`)
   - Pass companyId to dashboardData query

2. **Contacts** (`src/app/contacts/page.tsx`)
   - Pass companyId to directory queries

3. **Documents** (`src/app/documents/page.tsx`)
   - Pass companyId to documentEntities query
   - Pass companyId to all document mutations

4. **Schedules** (`src/app/schedules/page.tsx`)
   - Pass companyId to frontDeskSchedules query
   - Pass companyId to doctorSchedules query
   - Pass companyId to schedule update mutations

5. **Tickets** (`src/app/tickets/page.tsx`)
   - Pass companyId to tickets query
   - Pass companyId in createTicket/updateTicket mutations

6. **Laboratory** (`src/app/laboratory/page.tsx`)
   - Pass companyId to labCases query
   - Pass companyId in labCase mutations

7. **HR/Employees** (`src/app/hr/employees/page.tsx`)
   - Pass companyId to employees query
   - Pass companyId in employee mutations

### Query Files to Update:
- `src/graphql/queries.ts` - Add companyId variable to queries
- `src/graphql/mutations.ts` - Add companyId to mutation inputs
- `src/graphql/schedule-queries.ts` - Add companyId variable
- `src/graphql/schedule-mutations.ts` - Add companyId parameter
- `src/graphql/ticket-queries.ts` - Add companyId variable
- `src/graphql/ticket-mutations.ts` - Add companyId to input
- `src/graphql/document-queries.ts` - Add companyId variable
- `src/graphql/document-mutations.ts` - Add companyId parameter
- `src/graphql/lab-queries.ts` - Add companyId variable
- `src/graphql/lab-mutations.ts` - Add companyId to input

## Testing Checklist

After all changes are complete:

### Database Testing:
- [ ] Run all seed scripts successfully
- [ ] Verify data has companyId assigned
- [ ] Test querying with and without companyId filter
- [ ] Verify indexes are created properly

### API Testing:
- [ ] Test each query with companyId parameter
- [ ] Test each query without companyId (should return all)
- [ ] Test mutations with companyId
- [ ] Verify company isolation (Company A can't see Company B's data)

### Frontend Testing:
- [ ] Select different companies and verify data updates
- [ ] Create new records and verify companyId is assigned
- [ ] Update records and verify companyId is preserved
- [ ] Delete records and verify no cross-company deletion

### Edge Cases:
- [ ] What happens when no company is selected?
- [ ] What happens with admin users who should see all data?
- [ ] Migration strategy for existing data without companyId
- [ ] Handling of shared/global data (if any)

## Migration Strategy

For existing production data:

```typescript
// Migration script to add companyId to existing records
import { connectToDatabase } from '../src/lib/db';
import Company from '../src/models/Company';
import [Model] from '../src/models/[Model]';

await connectToDatabase();

// Get default company
const defaultCompany = await Company.findOne();

// Update all records without companyId
await [Model].updateMany(
  { companyId: { $exists: false } },
  { $set: { companyId: defaultCompany._id.toString() } }
);
```

## Benefits

1. **Data Isolation**: Each company's data is completely isolated
2. **Multi-Tenancy**: Supports multiple companies in one database
3. **Performance**: Indexed queries are faster with company filtering
4. **Security**: Prevents accidental cross-company data access
5. **Scalability**: Easy to add new companies without schema changes

## Next Steps

1. Complete resolver updates (in progress)
2. Update all seed scripts
3. Update frontend queries and mutations
4. Test thoroughly with multiple companies
5. Create migration script for existing data
6. Update documentation and API guides
