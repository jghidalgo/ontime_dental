# User Management Implementation Guide

## Overview
Successfully implemented a complete user management system with company association. Users can be employees of specific companies and have different roles.

## What Was Created

### 1. Updated User Model (`src/models/User.ts`)
- **New Fields:**
  - `companyId`: Optional reference to Company (employees can be assigned to companies)
  - `phone`: Contact phone number
  - `position`: Job position
  - `department`: Department within company
  - `isActive`: Active status flag
- **Roles:** admin, manager, dentist, hygienist, assistant, receptionist, lab_tech
- **Indexes:** email, companyId, isActive for performance

### 2. GraphQL Schema & Resolvers

#### Type Definitions (`src/graphql/typeDefs.ts`)
```graphql
type User {
  id: ID!
  name: String!
  email: String!
  role: String!
  companyId: String
  phone: String
  position: String
  department: String
  isActive: Boolean!
  createdAt: String!
  updatedAt: String!
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
  role: String!
  companyId: String
  phone: String
  position: String
  department: String
}

input UpdateUserInput {
  name: String
  email: String
  password: String
  role: String
  companyId: String
  phone: String
  position: String
  department: String
  isActive: Boolean
}
```

#### Queries
- `users(companyId: ID)`: Get all users, optionally filtered by company
- `user(id: ID!)`: Get single user by ID

#### Mutations
- `createUser(input: CreateUserInput!)`: Create new user
- `updateUser(id: ID!, input: UpdateUserInput!)`: Update existing user
- `deleteUser(id: ID!)`: Delete user

### 3. GraphQL Files

#### `src/graphql/user-queries.ts`
- GET_USERS: Query for all users with optional company filter
- GET_USER: Query for single user

#### `src/graphql/user-mutations.ts`
- CREATE_USER: Mutation to create user
- UPDATE_USER: Mutation to update user
- DELETE_USER: Mutation to delete user

#### `src/graphql/resolvers.ts`
- Added user queries with company filtering
- Added user mutations with email uniqueness validation
- Password is only updated if provided (for edits)

### 4. UI Component (`src/components/UsersTab.tsx`)

**Features:**
- **User List Table** with columns:
  - Name (with phone)
  - Email
  - Role (color-coded badge)
  - Company (short name)
  - Position
  - Status (Active/Inactive toggle)
  - Actions (Edit, Delete)

- **Filter by Company:** Dropdown to filter users by company
- **Create/Edit Modal** with fields:
  - Full Name*
  - Email*
  - Password* (required for new, optional for edit)
  - Role* (dropdown with 7 roles)
  - Company (optional dropdown)
  - Position
  - Phone
  - Department

- **Status Toggle:** Click status to activate/deactivate users
- **Delete Confirmation:** Safety prompt before deletion
- **Empty States:** Friendly messages when no users exist

### 5. Settings Page Integration
- Added `UsersTab` import to Settings page
- Replaced placeholder with actual UsersTab component
- Tabs: Companies | **Users** | System

### 6. Seed Script (`scripts/seed-users.ts`)

Creates 12 sample users across 4 companies:

**CDS Florida (4 users):**
- Dr. Sarah Johnson (Dentist)
- Michael Chen (Manager)
- Emily Rodriguez (Hygienist)
- James Wilson (Receptionist)

**OnTime PR (3 users):**
- Dr. Maria Santos (Dentist)
- Carlos Rivera (Assistant)
- Ana Lopez (Receptionist)

**Smile Care Central (2 users):**
- Dr. Robert Taylor (Dentist)
- Lisa Anderson (Hygienist)

**Dental Health Associates (2 users):**
- Dr. David Martinez (Dentist)
- Jessica Brown (Lab Technician)

**Global (1 user):**
- System Administrator (Admin, no company)

## How to Use

### 1. Run Database Seed
```bash
# First, ensure companies exist
npx tsx scripts/seed-companies.ts

# Then seed users
npx tsx scripts/seed-users.ts
```

### 2. Access User Management
1. Navigate to Settings (Profile Menu → Settings)
2. Click the "Users" tab
3. Use the interface to:
   - Create new users
   - Edit existing users
   - Toggle active/inactive status
   - Delete users
   - Filter by company

### 3. User Roles
- **Admin:** Full system access
- **Manager:** Operational management
- **Dentist:** Clinical staff (dentist)
- **Hygienist:** Clinical staff (hygienist)
- **Assistant:** Dental assistant
- **Receptionist:** Front desk
- **Lab Technician:** Laboratory work

## Key Features

### Email Uniqueness
- Backend validation prevents duplicate emails
- Error shown if email already exists

### Company Association
- Users can be assigned to specific companies
- Filter users by company in the UI
- Company selector shows company name in table

### Password Management
- Required when creating new users
- Optional when updating (only updates if provided)
- **Note:** In production, ensure proper password hashing!

### Status Management
- Toggle users active/inactive
- Inactive users can be filtered out in future features

### Validation
- Required fields marked with red asterisk (*)
- Email format validation
- Name, Email, Password, Role are required for new users

## Database Schema

```typescript
User {
  _id: ObjectId
  name: string (required)
  email: string (required, unique, lowercase)
  password: string (required)
  role: enum (required)
  companyId: string (optional)
  phone: string (optional)
  position: string (optional)
  department: string (optional)
  isActive: boolean (default: true)
  createdAt: Date
  updatedAt: Date
}
```

## Future Enhancements

1. **Password Security:**
   - Implement bcrypt password hashing
   - Password strength requirements
   - Password reset functionality

2. **Permissions:**
   - Role-based access control (RBAC)
   - Company-based data filtering
   - Admin-only user management

3. **User Profile:**
   - Avatar upload
   - Additional contact info
   - Emergency contacts

4. **Audit Trail:**
   - Track user creation/modifications
   - Login history
   - Activity logs

5. **Bulk Operations:**
   - Import users from CSV
   - Bulk activate/deactivate
   - Export user list

## Testing Credentials

All seeded users have password: `password123`

Example logins:
- sarah.johnson@cds.com / password123
- maria.santos@ontime.pr / password123
- sysadmin@ontimedental.com / password123

**Important:** Change default passwords in production!
