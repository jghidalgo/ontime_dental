# Testing Permissions System - Step by Step Guide

## Current Status
✅ Admin user created with all 12 modules enabled
✅ Backend properly returns permissions in all queries/mutations
✅ Logout clears both token and permissions from localStorage
✅ Console logging added to track permission changes

## Testing Instructions

### Step 1: Login and Check Initial State
1. Open browser and navigate to http://localhost:3000/login
2. Open Developer Console (F12)
3. Login with:
   - Email: admin@ontimedental.com
   - Password: admin123 (or your password)
4. After login, check Console for login response
5. Check localStorage:
   ```javascript
   localStorage.getItem('ontime.authToken')
   localStorage.getItem('ontime.userPermissions')
   ```
6. You should see all 12 modules in the navigation menu

### Step 2: Create a Test User
1. Go to Settings > Users tab
2. Click "Add User" button
3. Create a new user:
   - Name: Test User
   - Email: test@ontimedental.com
   - Password: test123
   - Role: receptionist
4. Click Save
5. New user should have all 12 modules by default

### Step 3: Modify Test User Permissions
1. In Settings > Users, find "Test User"
2. Click the ⚙️ (gear/settings) icon for Test User
3. Permissions modal should open showing all modules
4. **Open Console (F12) - Important!**
5. Uncheck 3 modules (e.g., Laboratory, HR, Medication)
6. Click "Save Permissions"
7. **Check Console Output:**
   ```
   === SAVING PERMISSIONS ===
   User ID: [user-id]
   User Email: test@ontimedental.com
   Current permissions: {...}
   New selected modules: [array without unchecked modules]
   Mutation variables: {...}
   ```
8. **Check for success:**
   ```
   === UPDATE RESULT ===
   Full result: {...}
   Updated user permissions: {...}
   ```
9. Green success message should appear
10. Modal should close

### Step 4: Verify Database Update
Run this command in terminal:
```bash
npx tsx scripts/check-user-permissions.ts
```

You should see:
- Admin User: 12 modules
- Test User: 9 modules (3 removed)

### Step 5: Test Login with Restricted User
1. Click Logout (top right)
2. **Check Console** - should see localStorage being cleared
3. Verify localStorage is empty:
   ```javascript
   localStorage.getItem('ontime.authToken') // null
   localStorage.getItem('ontime.userPermissions') // null
   ```
4. Login as Test User:
   - Email: test@ontimedental.com
   - Password: test123
5. **Check Console** for login response with permissions
6. **Check localStorage**:
   ```javascript
   JSON.parse(localStorage.getItem('ontime.userPermissions'))
   ```
   Should show only 9 modules (without Laboratory, HR, Medication)
7. **Verify Navigation Menu**:
   - Should NOT see: Laboratory, HR, Medication links
   - Should see: Dashboard, Documents, Contacts, etc.

### Step 6: Troubleshooting

If permissions are NOT updating:

**A. Check Console Logs**
Look for errors in the Console when clicking "Save Permissions"

**B. Check Network Tab**
1. Open Network tab in DevTools
2. Filter by "graphql"
3. Click "Save Permissions"
4. Find the "graphql" request
5. Check Request Payload:
   ```json
   {
     "operationName": "UpdateUser",
     "variables": {
       "id": "...",
       "input": {
         "permissions": {
           "modules": ["dashboard", "documents", ...]
         }
       }
     }
   }
   ```
6. Check Response - should include updated permissions

**C. Check Database Directly**
```bash
npx tsx scripts/check-user-permissions.ts
```

**D. Common Issues:**

1. **GraphQL Error:**
   - Check Console for GraphQL errors
   - Check if UPDATE_USER mutation is defined
   - Verify server is running

2. **Permissions Not Persisting:**
   - Check if refetch() is being called
   - Check if modal closes after save
   - Verify database connection

3. **Navigation Not Updating:**
   - Clear localStorage completely
   - Hard refresh (Ctrl+Shift+R)
   - Logout and login again

4. **Old Permissions Still Showing:**
   - Make sure logout clears `ontime.userPermissions`
   - Check if login overwrites old permissions
   - Verify TopNavigation reads from localStorage

## Expected Console Output

### When Saving Permissions:
```
=== SAVING PERMISSIONS ===
User ID: 68e71ced1f64e759e92f81e1
User Email: test@ontimedental.com
Current permissions: {modules: Array(12)}
New selected modules: (9) ['dashboard', 'documents', 'contacts', 'schedules', 'tickets', 'insurances', 'complaints', 'licenses', 'settings']
Mutation variables: {id: '68e71ced1f64e759e92f81e1', input: {…}}

=== UPDATE RESULT ===
Full result: {data: {…}}
Updated user permissions: {modules: Array(9)}
```

### When Logging Out:
```
Clearing localStorage...
ontime.authToken removed
ontime.userPermissions removed
```

### When Logging In:
```
Login successful
User permissions: {modules: Array(9)}
Storing in localStorage...
```

## Success Criteria
✅ Permissions modal shows current user permissions
✅ Checking/unchecking modules updates selectedModules state
✅ Clicking Save calls UPDATE_USER mutation
✅ Database gets updated with new permissions
✅ Success message appears
✅ Logout clears both token and permissions
✅ Login fetches new permissions from database
✅ Navigation menu filters based on permissions
✅ Changes persist across sessions
