# Contacts Module - Backend API Documentation

## Overview
The Contacts module backend is fully implemented with GraphQL mutations for **editing**, **deleting**, and **reordering** directory entries via drag-and-drop.

---

## 🎯 Features Implemented

### 1. **Update Directory Entry** (Edit Cards)
- ✅ GraphQL mutation: `updateDirectoryEntry`
- ✅ Updates any field: location, phone, extension, department, employee
- ✅ Resolver implemented with validation

### 2. **Delete Directory Entry** (Remove Cards)
- ✅ GraphQL mutation: `deleteDirectoryEntry`
- ✅ Permanently removes entry from database
- ✅ Returns boolean success status

### 3. **Reorder Entries** (Drag & Drop)
- ✅ GraphQL mutation: `reorderDirectoryEntries`
- ✅ Updates order field for all entries in a group
- ✅ Maintains sort order across queries

### 4. **Order Field**
- ✅ Added to DirectoryEntry model
- ✅ Default value: 0
- ✅ All queries now return entries sorted by order

---

## 📡 GraphQL API

### Mutations

#### 1. Update Entry (Edit)
```graphql
mutation UpdateDirectoryEntry($id: ID!, $input: DirectoryEntryInput!) {
  updateDirectoryEntry(id: $id, input: $input) {
    id
    entityId
    group
    location
    phone
    extension
    department
    employee
    order
  }
}
```

**Example Variables:**
```json
{
  "id": "6752abc123def456789",
  "input": {
    "entityId": "bluno-james",
    "group": "corporate",
    "location": "Updated Location",
    "phone": "(305) 555-9999",
    "extension": "1001",
    "department": "Executive Suite",
    "employee": "John Doe",
    "order": 0
  }
}
```

#### 2. Delete Entry (Remove)
```graphql
mutation DeleteDirectoryEntry($id: ID!) {
  deleteDirectoryEntry(id: $id)
}
```

**Example Variables:**
```json
{
  "id": "6752abc123def456789"
}
```

#### 3. Reorder Entries (Drag & Drop)
```graphql
mutation ReorderDirectoryEntries($entityId: String!, $group: String!, $entryIds: [ID!]!) {
  reorderDirectoryEntries(entityId: $entityId, group: $group, entryIds: $entryIds) {
    id
    entityId
    group
    location
    phone
    extension
    department
    employee
    order
  }
}
```

**Example Variables:**
```json
{
  "entityId": "bluno-james",
  "group": "corporate",
  "entryIds": [
    "6752abc123def456789",
    "6752abc123def456788",
    "6752abc123def456787"
  ]
}
```
*Note: The order of IDs in the array determines the new order (index 0 = first, index 1 = second, etc.)*

#### 4. Create Entry (Add New)
```graphql
mutation CreateDirectoryEntry($input: DirectoryEntryInput!) {
  createDirectoryEntry(input: $input) {
    id
    entityId
    group
    location
    phone
    extension
    department
    employee
    order
  }
}
```

**Example Variables:**
```json
{
  "input": {
    "entityId": "bluno-james",
    "group": "corporate",
    "location": "New Office",
    "phone": "(305) 555-1234",
    "extension": "1020",
    "department": "Sales",
    "employee": "Jane Smith",
    "order": 0
  }
}
```

---

## 🔌 Client-Side Integration

### Import Mutations
```typescript
import { 
  UPDATE_DIRECTORY_ENTRY, 
  DELETE_DIRECTORY_ENTRY, 
  REORDER_DIRECTORY_ENTRIES,
  CREATE_DIRECTORY_ENTRY 
} from '@/graphql/mutations';
```

### Example: Edit Entry
```typescript
import { useMutation } from '@apollo/client';
import { UPDATE_DIRECTORY_ENTRY } from '@/graphql/mutations';
import { GET_ALL_DIRECTORY_DATA } from '@/graphql/queries';

function ContactCard({ entry }) {
  const [updateEntry] = useMutation(UPDATE_DIRECTORY_ENTRY, {
    refetchQueries: [{ query: GET_ALL_DIRECTORY_DATA }]
  });

  const handleEdit = async (updatedData) => {
    try {
      await updateEntry({
        variables: {
          id: entry.id,
          input: {
            entityId: entry.entityId,
            group: entry.group,
            ...updatedData
          }
        }
      });
      // Success! Data will auto-refresh
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };
}
```

### Example: Delete Entry
```typescript
import { useMutation } from '@apollo/client';
import { DELETE_DIRECTORY_ENTRY } from '@/graphql/mutations';
import { GET_ALL_DIRECTORY_DATA } from '@/graphql/queries';

function ContactCard({ entry }) {
  const [deleteEntry] = useMutation(DELETE_DIRECTORY_ENTRY, {
    refetchQueries: [{ query: GET_ALL_DIRECTORY_DATA }]
  });

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry({
          variables: { id: entry.id }
        });
        // Success! Entry removed and data refreshed
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };
}
```

### Example: Drag & Drop Reorder
```typescript
import { useMutation } from '@apollo/client';
import { REORDER_DIRECTORY_ENTRIES } from '@/graphql/mutations';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function ContactsList({ entries, entityId, group }) {
  const [reorderEntries] = useMutation(REORDER_DIRECTORY_ENTRIES);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = entries.findIndex(e => e.id === active.id);
      const newIndex = entries.findIndex(e => e.id === over.id);
      
      // Reorder locally for optimistic UI
      const reordered = arrayMove(entries, oldIndex, newIndex);
      
      // Save to backend
      try {
        await reorderEntries({
          variables: {
            entityId,
            group,
            entryIds: reordered.map(e => e.id)
          }
        });
      } catch (error) {
        console.error('Error reordering entries:', error);
      }
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={entries} strategy={verticalListSortingStrategy}>
        {entries.map(entry => (
          <SortableContactCard key={entry.id} entry={entry} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

---

## 🗄️ Database Schema

### DirectoryEntry Model
```typescript
{
  _id: ObjectId,              // MongoDB ID
  entityId: String,           // Entity reference (e.g., "bluno-james")
  group: String,              // Group: "corporate" | "frontdesk" | "offices"
  location: String,           // Office/clinic location
  phone: String,              // Phone number
  extension: String,          // Extension number
  department: String,         // Department name
  employee: String,           // Employee name
  order: Number,              // Sort order (0, 1, 2, ...)
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

### Indexes
- `entityId` + `group` (compound index for fast filtering)
- Queries automatically sort by `order: 1` (ascending)

---

## 🧪 Testing the API

### Using GraphQL Playground
1. Navigate to: `http://localhost:3001/api/graphql`
2. Use the mutations above with example variables
3. Check the database or query `allDirectoryData` to verify

### Using the UI
Once the UI integrates these mutations:
1. **Edit**: Click edit button on a contact card → modify fields → save
2. **Delete**: Click delete button → confirm → entry removed
3. **Drag & Drop**: Click and drag contact cards to reorder → order saved automatically

---

## ✅ Checklist: Integration Steps

- [x] GraphQL schema extended with mutations
- [x] Resolvers implemented for all CRUD operations
- [x] `order` field added to DirectoryEntry model
- [x] Database reseeded with order values
- [x] Mutations file created (`src/graphql/mutations.ts`)
- [x] Queries updated to sort by order
- [ ] UI components updated to call mutations
- [ ] Edit modal/form connected to `updateDirectoryEntry`
- [ ] Delete button connected to `deleteDirectoryEntry`
- [ ] Drag & drop connected to `reorderDirectoryEntries`

---

## 🚀 Next Steps for UI Integration

1. **Add Edit Functionality**
   - Create edit modal/dialog component
   - Pre-fill form with existing entry data
   - Call `UPDATE_DIRECTORY_ENTRY` mutation on submit
   - Show success/error feedback

2. **Add Delete Functionality**
   - Add delete button to each table row
   - Show confirmation dialog
   - Call `DELETE_DIRECTORY_ENTRY` mutation
   - Refresh data after deletion

3. **Add Drag & Drop**
   - Wrap table rows with `@dnd-kit` sortable components
   - Implement `onDragEnd` handler
   - Call `REORDER_DIRECTORY_ENTRIES` mutation
   - Show visual feedback during drag

4. **Add Create Functionality**
   - Create "Add New Contact" button/modal
   - Build form for new entry
   - Call `CREATE_DIRECTORY_ENTRY` mutation
   - Refresh data after creation

---

## 📚 Dependencies Installed

```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x"
}
```

---

## 💡 Tips

1. **Optimistic Updates**: Use Apollo Client's `optimisticResponse` for instant UI feedback
2. **Cache Management**: Mutations automatically refetch `GET_ALL_DIRECTORY_DATA`
3. **Error Handling**: All mutations return errors in the standard GraphQL format
4. **Validation**: Backend validates all required fields before saving
5. **Order Persistence**: Order is maintained across sessions and refreshes

---

**Backend Status**: ✅ **COMPLETE & READY FOR UI INTEGRATION**
