# User Permissions System

## Overview
The OnTime Dental application now includes a comprehensive permissions system that allows administrators to control which modules each user can access. This is managed through the Settings > Users interface.

## Features

### 1. Module-Level Access Control
Administrators can grant or revoke access to the following modules for each user:
- **Dashboard**: View dashboard and analytics
- **Documents**: Access document management
- **Contacts**: Manage contacts and directory
- **Schedules**: View and manage schedules
- **Tickets**: Access ticket system
- **Laboratory**: Laboratory management
- **HR**: Human resources module
- **Insurances**: Insurance management
- **Settings**: System settings and configuration

### 2. User Interface
- **Settings Icon**: In the Users table (Settings > Users tab), each user has a gear icon to manage permissions
- **Permissions Modal**: Wide modal with 3-column grid layout showing all available modules
- **Module Cards**: Each module displays:
  - Checkbox for toggling access
  - Module name and description
  - On/Off status badge
- **Bulk Actions**: 
  - "Select All" - Grant access to all modules
  - "Clear All" - Revoke access to all modules (requires at least one module)

### 3. Navigation Filtering
When a user logs in, the top navigation menu automatically filters to show only the modules they have permission to access.

## Technical Implementation

### Backend Changes

#### 1. User Model (`src/models/User.ts`)
```typescript
export interface IUser {
  // ... existing fields ...
  permissions?: {
    modules: string[];
  };
}
```

#### 2. GraphQL Schema (`src/graphql/typeDefs.ts`)
```graphql
type User {
  # ... existing fields ...
  permissions: UserPermissions
}

type UserPermissions {
  modules: [String!]!
}

input UpdateUserInput {
  # ... existing fields ...
  permissions: UserPermissionsInput
}

input UserPermissionsInput {
  modules: [String!]!
}
```

#### 3. Login Response
The login mutation now returns user permissions along with the token and user data.

#### 4. Default Permissions
New users are created with full access to all modules by default:
```javascript
{
  modules: ['dashboard', 'documents', 'contacts', 'schedules', 'tickets', 
           'laboratory', 'hr', 'insurances', 'settings']
}
```

### Frontend Changes

#### 1. Login Flow (`src/app/(auth)/login/LoginForm.tsx`)
- Fetches user permissions during login
- Stores permissions in `localStorage` as `ontime.userPermissions`

#### 2. Top Navigation (`src/components/TopNavigation.tsx`)
- Reads permissions from `localStorage` on component mount
- Filters navigation items based on allowed modules
- Shows loading state while permissions are being loaded

#### 3. Permissions Management (`src/components/UsersTab.tsx`)
- Settings icon in each user row
- Modal for managing module access
- GraphQL mutation to save permissions
- Real-time updates after saving

## Usage Guide

### For Administrators

#### Managing User Permissions:
1. Navigate to **Settings** in the top navigation
2. Click the **Users** tab
3. Locate the user whose permissions you want to modify
4. Click the **gear icon** (⚙️) in the Actions column
5. In the permissions modal:
   - Check/uncheck modules to grant/revoke access
   - Use "Select All" or "Clear All" for bulk changes
   - Click "Save Permissions" to apply changes

#### Important Notes:
- Users must have at least one module enabled
- Changes take effect on the user's next login
- The Settings module allows users to manage other users (if they have access)

### For End Users
- After logging in, you'll only see navigation links for modules you have access to
- If you try to access a restricted module directly (via URL), you should be redirected
- Contact your administrator if you need access to additional modules

## Migration

### Adding Permissions to Existing Users
Run the migration script to add default permissions to all existing users:

```bash
npx tsx scripts/migrate-user-permissions.ts
```

This script will:
- Connect to your MongoDB database
- Find all users without permissions
- Add default permissions (all modules enabled)
- Display a summary of updated users

## Security Considerations

1. **Client-Side Filtering**: The navigation filtering is currently client-side only
2. **Future Enhancement**: Consider adding server-side route protection to prevent unauthorized access
3. **Permission Storage**: Permissions are stored in localStorage and the database
4. **Token-Based**: Could enhance security by encoding permissions in JWT tokens

## Future Enhancements

Potential improvements to the permissions system:

1. **Fine-Grained Permissions**: Beyond module visibility (CRUD operations, specific features)
2. **Role-Based Templates**: Pre-configured permission sets for common roles
3. **Permission Inheritance**: Hierarchical permissions based on organizational structure
4. **Audit Trail**: Log all permission changes with timestamps and administrators
5. **Server-Side Route Guards**: Protect routes at the API level
6. **Permission Expiration**: Temporary access grants with auto-expiration
7. **Custom Permissions**: Allow creation of custom permission categories

## API Reference

### GraphQL Queries

#### Get Users with Permissions
```graphql
query GetUsers($companyId: ID) {
  users(companyId: $companyId) {
    id
    name
    email
    permissions {
      modules
    }
  }
}
```

### GraphQL Mutations

#### Update User Permissions
```graphql
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    permissions {
      modules
    }
  }
}
```

Example variables:
```json
{
  "id": "user-id-here",
  "input": {
    "permissions": {
      "modules": ["dashboard", "documents", "contacts"]
    }
  }
}
```

## Troubleshooting

### Users Not Seeing Permissions Changes
- Users need to log out and log back in for permission changes to take effect
- Clear browser localStorage if permissions seem cached incorrectly

### All Modules Showing for Restricted Users
- Check if permissions are properly stored in the database
- Verify the login mutation is returning permissions
- Check browser console for JavaScript errors
- Ensure localStorage has `ontime.userPermissions` key

### Migration Script Errors
- Verify MongoDB connection string in `.env.local`
- Ensure the database is running and accessible
- Check that the User model is properly defined

## Related Files

### Backend
- `src/models/User.ts` - User model with permissions field
- `src/graphql/typeDefs.ts` - GraphQL type definitions
- `src/graphql/resolvers.ts` - Login resolver returning permissions
- `src/graphql/user-queries.ts` - User queries including permissions
- `src/graphql/user-mutations.ts` - User mutations for updating permissions

### Frontend
- `src/app/(auth)/login/LoginForm.tsx` - Login form storing permissions
- `src/components/TopNavigation.tsx` - Navigation with permission filtering
- `src/components/UsersTab.tsx` - Permissions management UI

### Scripts
- `scripts/migrate-user-permissions.ts` - Migration script for existing users
