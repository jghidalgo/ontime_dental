# HR/Employees Module Backend Implementation

## Overview
Complete GraphQL backend implementation for the HR/Employees module with MongoDB database integration.

## Components Created

### 1. Database Model
**File:** `src/models/Employee.ts`
- MongoDB schema with Mongoose ODM
- Fields: employeeId, name, joined, dateOfBirth, phone, position, location, email, department, status, emergencyContact
- Indexes on: employeeId (unique), text search (name, position, location), status, location, position
- Timestamps for createdAt and updatedAt

### 2. GraphQL Schema
**File:** `src/graphql/typeDefs.ts`
- Added `Employee` type with full employee details
- Added `EmployeeBasic` type for simple employee references (used in schedules)
- Added `EmergencyContact` type for emergency contact information
- Input types: `EmployeeCreateInput`, `EmployeeUpdateInput`, `EmergencyContactInput`

**Queries:**
- `employees(search, location, position, status, limit, offset)` - List employees with filters
- `employee(id)` - Get employee by MongoDB ID
- `employeeByEmployeeId(employeeId)` - Get employee by employee ID (e.g., "EMP-001")

**Mutations:**
- `createEmployee(input)` - Create new employee
- `updateEmployee(id, input)` - Update existing employee
- `deleteEmployee(id)` - Delete employee

### 3. GraphQL Resolvers
**File:** `src/graphql/resolvers.ts`
- Query resolvers with filtering support (search, location, position, status)
- Text search across name, position, location, employeeId, and phone
- Mutation resolvers with validation
- Duplicate employeeId check on creation

### 4. GraphQL Client Queries & Mutations
**Files:**
- `src/graphql/employee-queries.ts` - GET_EMPLOYEES, GET_EMPLOYEE, GET_EMPLOYEE_BY_EMPLOYEE_ID
- `src/graphql/employee-mutations.ts` - CREATE_EMPLOYEE, UPDATE_EMPLOYEE, DELETE_EMPLOYEE

### 5. Seed Script
**File:** `scripts/seed-employees.ts`
- Seeds 21 employee records
- Includes employees from various departments: Clinical, Laboratory, Operations, Finance, HR, Management, Compliance
- Locations: Little Havana, Pembroke Pines, Tamami, Lab, Corporate

### 6. Updated Frontend
**File:** `src/app/hr/employees/page.tsx`
- Integrated with GraphQL using Apollo Client
- Real-time data fetching with 30-second polling
- Server-side search via GraphQL
- Loading and error states
- Displays employeeId instead of internal MongoDB ID

## Features

### Search & Filter
- Text search across multiple fields (name, position, location, employeeId, phone)
- Filter by location
- Filter by position
- Filter by status (active, inactive, on-leave)
- Pagination support

### Employee Status
- active - Currently employed
- inactive - No longer employed
- on-leave - Temporarily absent

### Data Fields
- **employeeId**: Unique identifier (e.g., EMP-001)
- **name**: Full name
- **joined**: Date joined (MM/DD/YYYY)
- **dateOfBirth**: Date of birth (MM/DD/YYYY)
- **phone**: Contact phone number
- **position**: Job title
- **location**: Work location
- **email**: Email address (optional)
- **department**: Department name (optional)
- **status**: Employment status
- **emergencyContact**: Emergency contact details (optional)

## Usage

### Seed Database
```bash
npx tsx scripts/seed-employees.ts
```

### Example Queries

**Get all employees:**
```graphql
query {
  employees {
    id
    employeeId
    name
    position
    location
    status
  }
}
```

**Search employees:**
```graphql
query {
  employees(search: "Hygienist") {
    id
    employeeId
    name
    position
    location
  }
}
```

**Filter by location:**
```graphql
query {
  employees(location: "Little Havana") {
    id
    employeeId
    name
    position
  }
}
```

**Get specific employee:**
```graphql
query {
  employeeByEmployeeId(employeeId: "EMP-001") {
    id
    employeeId
    name
    position
    location
    email
    department
    status
    emergencyContact {
      name
      relationship
      phone
    }
  }
}
```

### Example Mutations

**Create employee:**
```graphql
mutation {
  createEmployee(input: {
    employeeId: "EMP-022"
    name: "John Doe"
    joined: "01/15/2024"
    dateOfBirth: "05/10/1990"
    phone: "(305) 555-1234"
    position: "Dental Hygienist"
    location: "Little Havana"
    email: "john.doe@ontimedental.com"
    department: "Clinical"
    status: "active"
  }) {
    id
    employeeId
    name
  }
}
```

**Update employee:**
```graphql
mutation {
  updateEmployee(
    id: "..."
    input: {
      position: "Senior Hygienist"
      status: "active"
    }
  ) {
    id
    employeeId
    name
    position
    status
  }
}
```

**Delete employee:**
```graphql
mutation {
  deleteEmployee(id: "...")
}
```

## Database Schema

```typescript
{
  employeeId: String (unique, indexed)
  name: String (required, text-indexed)
  joined: String (required)
  dateOfBirth: String (required)
  phone: String (required)
  position: String (required, text-indexed)
  location: String (required, text-indexed, indexed)
  email: String (optional)
  department: String (optional)
  status: 'active' | 'inactive' | 'on-leave' (indexed)
  emergencyContact: {
    name: String
    relationship: String
    phone: String
  }
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

## API Endpoints

GraphQL endpoint: `/api/graphql`

All employee operations go through this single endpoint using GraphQL queries and mutations.

## Notes

- Employee data automatically polls every 30 seconds in the frontend
- Search is case-insensitive and searches across multiple fields
- EmployeeId must be unique when creating new employees
- Soft delete can be implemented by setting status to 'inactive' instead of using deleteEmployee
- Emergency contact information is optional but recommended for safety compliance
