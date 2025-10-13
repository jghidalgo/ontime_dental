# Schedules Module - Backend API Documentation

## Overview
The Schedules module backend is fully implemented with GraphQL queries and mutations for managing **Front Desk Schedules** and **Doctor Schedules** with full **drag-and-drop swap** functionality.

---

## 🎯 Features Implemented

### 1. **Front Desk Schedules**
- ✅ 3 positions (Front Desk, Assistant 1, Assistant 2)
- ✅ 2 clinics (CE, Miller)
- ✅ Employee assignments with name and ID
- ✅ Update individual assignments
- ✅ Swap assignments via drag-and-drop

### 2. **Doctor Schedules**
- ✅ 6 days (Monday-Saturday)
- ✅ 2 clinics (CE, Miller)
- ✅ Doctor assignments with name, ID, and shift (AM/PM)
- ✅ Update individual assignments
- ✅ Swap assignments via drag-and-drop

### 3. **Database Features**
- ✅ Unique compound indexes (position+clinic, day+clinic)
- ✅ Null support for unassigned slots
- ✅ Timestamps for tracking changes
- ✅ Upsert capability for seamless updates

---

## 📡 GraphQL API

### Types

#### Employee (Front Desk)
```graphql
type Employee {
  id: String!
  name: String!
}
```

#### FrontDeskSchedule
```graphql
type FrontDeskSchedule {
  id: ID!
  positionId: String!    # 'front-desk', 'assistant-1', 'assistant-2'
  clinicId: String!      # 'ce', 'miller'
  employee: Employee     # Can be null if unassigned
}
```

#### DoctorAssignment
```graphql
type DoctorAssignment {
  id: String!
  name: String!
  shift: String!         # 'AM' or 'PM'
}
```

#### DoctorSchedule
```graphql
type DoctorSchedule {
  id: ID!
  dayId: String!         # 'monday', 'tuesday', etc.
  clinicId: String!      # 'ce', 'miller'
  doctor: DoctorAssignment  # Can be null if unassigned
}
```

---

### Queries

#### 1. Get All Front Desk Schedules
```graphql
query GetFrontDeskSchedules {
  frontDeskSchedules {
    id
    positionId
    clinicId
    employee {
      id
      name
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "frontDeskSchedules": [
      {
        "id": "64f3b2a1...",
        "positionId": "front-desk",
        "clinicId": "ce",
        "employee": {
          "id": "dagmar",
          "name": "Dagmar"
        }
      },
      // ... more entries
    ]
  }
}
```

#### 2. Get All Doctor Schedules
```graphql
query GetDoctorSchedules {
  doctorSchedules {
    id
    dayId
    clinicId
    doctor {
      id
      name
      shift
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "doctorSchedules": [
      {
        "id": "64f3b2a2...",
        "dayId": "monday",
        "clinicId": "ce",
        "doctor": {
          "id": "jorge-blanco",
          "name": "Dr. Jorge Blanco",
          "shift": "AM"
        }
      },
      // ... more entries
    ]
  }
}
```

---

### Mutations

#### 1. Update Front Desk Schedule (Edit Employee)
```graphql
mutation UpdateFrontDeskSchedule(
  $positionId: String!
  $clinicId: String!
  $employee: EmployeeInput
) {
  updateFrontDeskSchedule(
    positionId: $positionId
    clinicId: $clinicId
    employee: $employee
  ) {
    id
    positionId
    clinicId
    employee {
      id
      name
    }
  }
}
```

**Variables:**
```json
{
  "positionId": "front-desk",
  "clinicId": "ce",
  "employee": {
    "id": "maria",
    "name": "María González"
  }
}
```

**To clear an assignment (set to null):**
```json
{
  "positionId": "front-desk",
  "clinicId": "ce",
  "employee": null
}
```

#### 2. Update Doctor Schedule (Edit Doctor)
```graphql
mutation UpdateDoctorSchedule(
  $dayId: String!
  $clinicId: String!
  $doctor: DoctorAssignmentInput
) {
  updateDoctorSchedule(
    dayId: $dayId
    clinicId: $clinicId
    doctor: $doctor
  ) {
    id
    dayId
    clinicId
    doctor {
      id
      name
      shift
    }
  }
}
```

**Variables:**
```json
{
  "dayId": "monday",
  "clinicId": "ce",
  "doctor": {
    "id": "sarah-kim",
    "name": "Dr. Sarah Kim",
    "shift": "PM"
  }
}
```

#### 3. Swap Front Desk Assignments (Drag & Drop)
```graphql
mutation SwapFrontDeskAssignments(
  $sourcePositionId: String!
  $sourceClinicId: String!
  $targetPositionId: String!
  $targetClinicId: String!
) {
  swapFrontDeskAssignments(
    sourcePositionId: $sourcePositionId
    sourceClinicId: $sourceClinicId
    targetPositionId: $targetPositionId
    targetClinicId: $targetClinicId
  ) {
    id
    positionId
    clinicId
    employee {
      id
      name
    }
  }
}
```

**Variables (Swap Front Desk CE with Assistant 1 Miller):**
```json
{
  "sourcePositionId": "front-desk",
  "sourceClinicId": "ce",
  "targetPositionId": "assistant-1",
  "targetClinicId": "miller"
}
```

**Response:** Returns both updated schedules

#### 4. Swap Doctor Assignments (Drag & Drop)
```graphql
mutation SwapDoctorAssignments(
  $sourceDayId: String!
  $sourceClinicId: String!
  $targetDayId: String!
  $targetClinicId: String!
) {
  swapDoctorAssignments(
    sourceDayId: $sourceDayId
    sourceClinicId: $sourceClinicId
    targetDayId: $targetDayId
    targetClinicId: $targetClinicId
  ) {
    id
    dayId
    clinicId
    doctor {
      id
      name
      shift
    }
  }
}
```

**Variables (Swap Monday CE with Tuesday Miller):**
```json
{
  "sourceDayId": "monday",
  "sourceClinicId": "ce",
  "targetDayId": "tuesday",
  "targetClinicId": "miller"
}
```

---

## 🔌 Client-Side Integration

### Import Queries and Mutations
```typescript
import { useQuery, useMutation } from '@apollo/client';
import { GET_FRONT_DESK_SCHEDULES, GET_DOCTOR_SCHEDULES } from '@/graphql/schedule-queries';
import { 
  UPDATE_FRONT_DESK_SCHEDULE, 
  UPDATE_DOCTOR_SCHEDULE,
  SWAP_FRONT_DESK_ASSIGNMENTS,
  SWAP_DOCTOR_ASSIGNMENTS 
} from '@/graphql/schedule-mutations';
```

### Example: Fetch Schedules
```typescript
function SchedulesPage() {
  const { data: frontDeskData, loading: fdLoading } = useQuery(GET_FRONT_DESK_SCHEDULES);
  const { data: doctorData, loading: docLoading } = useQuery(GET_DOCTOR_SCHEDULES);

  // Transform data to match UI structure
  const frontDeskSchedule = useMemo(() => {
    const schedule: Record<string, Record<string, Employee | null>> = {};
    
    frontDeskData?.frontDeskSchedules.forEach((item: any) => {
      if (!schedule[item.positionId]) {
        schedule[item.positionId] = {};
      }
      schedule[item.positionId][item.clinicId] = item.employee;
    });
    
    return schedule;
  }, [frontDeskData]);
}
```

### Example: Update Employee Name
```typescript
const [updateFrontDesk] = useMutation(UPDATE_FRONT_DESK_SCHEDULE, {
  refetchQueries: [{ query: GET_FRONT_DESK_SCHEDULES }]
});

const handleSaveEdit = async (positionId: string, clinicId: string, newName: string) => {
  await updateFrontDesk({
    variables: {
      positionId,
      clinicId,
      employee: {
        id: generateId(newName), // Your ID generation logic
        name: newName
      }
    }
  });
};
```

### Example: Drag & Drop Swap
```typescript
const [swapFrontDesk] = useMutation(SWAP_FRONT_DESK_ASSIGNMENTS, {
  refetchQueries: [{ query: GET_FRONT_DESK_SCHEDULES }]
});

const handleFrontDeskDrop = async (
  sourcePos: string,
  sourceClinic: string,
  targetPos: string,
  targetClinic: string
) => {
  await swapFrontDesk({
    variables: {
      sourcePositionId: sourcePos,
      sourceClinicId: sourceClinic,
      targetPositionId: targetPos,
      targetClinicId: targetClinic
    }
  });
};
```

---

## 🗄️ Database Schema

### Front Desk Schedule Collection
```typescript
{
  _id: ObjectId,
  positionId: String,     // enum: ['front-desk', 'assistant-1', 'assistant-2']
  clinicId: String,       // enum: ['ce', 'miller']
  employee: {
    id: String,
    name: String
  } | null,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Unique compound index on `positionId` + `clinicId`

### Doctor Schedule Collection
```typescript
{
  _id: ObjectId,
  dayId: String,          // enum: ['monday', 'tuesday', ...]
  clinicId: String,       // enum: ['ce', 'miller']
  doctor: {
    id: String,
    name: String,
    shift: String         // enum: ['AM', 'PM']
  } | null,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Unique compound index on `dayId` + `clinicId`

---

## 🧪 Testing

### Test Script
```bash
npm run seed:schedules
```

### Manual GraphQL Testing
1. Go to `http://localhost:3001/api/graphql`
2. Test queries to fetch all schedules
3. Test mutations to update/swap assignments
4. Verify changes persist in MongoDB

---

## ✅ Implementation Checklist

- [x] Mongoose models created (FrontDeskSchedule, DoctorSchedule)
- [x] GraphQL schema extended with types and mutations
- [x] Resolvers implemented for all queries and mutations
- [x] Seed script created and executed (6 front desk + 12 doctor assignments)
- [x] Client queries file created (`schedule-queries.ts`)
- [x] Client mutations file created (`schedule-mutations.ts`)
- [ ] UI integrated with backend (connect existing handlers to GraphQL)

---

## 🚀 Next Steps for UI Integration

### Transform Backend Data to UI Format

The UI expects this structure:
```typescript
// Front Desk
const frontDeskSchedule: Record<string, Record<string, Employee | null>> = {
  'front-desk': { ce: { id: '...', name: '...' }, miller: {...} },
  'assistant-1': { ... },
  'assistant-2': { ... }
};

// Doctor
const doctorSchedule: Record<string, Record<string, DoctorAssignment | null>> = {
  monday: { ce: { id: '...', name: '...', shift: 'AM' }, miller: {...} },
  tuesday: { ... },
  ...
};
```

### Steps to Integrate:

1. **Replace `useState` with GraphQL queries**
   ```typescript
   const { data, loading, error } = useQuery(GET_FRONT_DESK_SCHEDULES);
   ```

2. **Transform data in `useMemo`**
   ```typescript
   const frontDeskSchedule = useMemo(() => transformScheduleData(data), [data]);
   ```

3. **Replace `handleSaveFrontDeskEdit` with mutation**
   ```typescript
   const [updateSchedule] = useMutation(UPDATE_FRONT_DESK_SCHEDULE);
   await updateSchedule({ variables: { ... } });
   ```

4. **Replace drag-drop logic with swap mutation**
   ```typescript
   const [swapAssignments] = useMutation(SWAP_FRONT_DESK_ASSIGNMENTS);
   await swapAssignments({ variables: { ... } });
   ```

---

**Backend Status**: ✅ **100% COMPLETE**

All backend functionality for Schedules module is implemented, tested, and ready for UI integration!
