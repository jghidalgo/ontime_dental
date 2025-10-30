# Documents Module Backend Reference

## Overview
The documents module backend is **FULLY IMPLEMENTED** and ready to use. All GraphQL queries, mutations, models, and seed data are in place.

## Database Status
✅ **MongoDB Collection**: `documententities`  
✅ **Seeded Records**: 3 document entities  
✅ **Total Documents**: 20 documents across 9 groups

### Seeded Entities:
1. **Blanco Amos Dental Group** (`blanco-amos-dental-group`)
   - Front Desk Forms (3 documents)
   - Human Resources Forms (3 documents)
   - Clinical Protocols (2 documents)
   - **Total**: 8 documents

2. **Complete Dental Lab** (`complete-dental-lab`)
   - Front Desk Forms (3 documents)
   - Compliance (2 documents)
   - Technical Specifications (1 document)
   - **Total**: 6 documents

3. **Complete Dental Supplies** (`complete-dental-supplies`)
   - Operations (3 documents)
   - Human Resources Forms (2 documents)
   - Product Catalog (1 document)
   - **Total**: 6 documents

## GraphQL Schema

### Types
```graphql
type DocumentRecord {
  id: String!
  title: String!
  version: String!
  date: String!
  description: String!
  url: String!
  fileName: String
}

type DocumentGroup {
  id: String!
  name: String!
  documents: [DocumentRecord!]!
}

type DocumentEntity {
  id: ID!
  entityId: String!
  name: String!
  groups: [DocumentGroup!]!
}

input DocumentRecordInput {
  id: String!
  title: String!
  version: String!
  date: String!
  description: String!
  url: String!
  fileName: String
}

input DocumentGroupInput {
  id: String!
  name: String!
  documents: [DocumentRecordInput!]
}
```

## Available GraphQL Operations

### Queries

#### 1. Get All Document Entities
```graphql
query GetAllDocumentEntities {
  documentEntities {
    id
    entityId
    name
    groups {
      id
      name
      documents {
        id
        title
        version
        date
        description
        url
        fileName
      }
    }
  }
}
```

#### 2. Get Single Document Entity
```graphql
query GetDocumentEntity($entityId: String!) {
  documentEntity(entityId: $entityId) {
    id
    entityId
    name
    groups {
      id
      name
      documents {
        id
        title
        version
        date
        description
        url
        fileName
      }
    }
  }
}
```

**Example Variables:**
```json
{
  "entityId": "blanco-amos-dental-group"
}
```

### Mutations

#### 1. Create Document Entity
```graphql
mutation CreateDocumentEntity($entityId: String!, $name: String!) {
  createDocumentEntity(entityId: $entityId, name: $name) {
    id
    entityId
    name
    groups {
      id
      name
    }
  }
}
```

**Example Variables:**
```json
{
  "entityId": "new-dental-practice",
  "name": "New Dental Practice"
}
```

#### 2. Update Document Entity
```graphql
mutation UpdateDocumentEntity($entityId: String!, $name: String) {
  updateDocumentEntity(entityId: $entityId, name: $name) {
    id
    entityId
    name
  }
}
```

#### 3. Delete Document Entity
```graphql
mutation DeleteDocumentEntity($entityId: String!) {
  deleteDocumentEntity(entityId: $entityId)
}
```

#### 4. Add Document Group
```graphql
mutation AddDocumentGroup($entityId: String!, $groupId: String!, $groupName: String!) {
  addDocumentGroup(entityId: $entityId, groupId: $groupId, groupName: $groupName) {
    id
    entityId
    name
    groups {
      id
      name
      documents {
        id
        title
      }
    }
  }
}
```

**Example Variables:**
```json
{
  "entityId": "blanco-amos-dental-group",
  "groupId": "new-forms",
  "groupName": "New Forms Category"
}
```

#### 5. Update Document Group
```graphql
mutation UpdateDocumentGroup($entityId: String!, $groupId: String!, $groupName: String!) {
  updateDocumentGroup(entityId: $entityId, groupId: $groupId, groupName: $groupName) {
    id
    groups {
      id
      name
    }
  }
}
```

#### 6. Delete Document Group
```graphql
mutation DeleteDocumentGroup($entityId: String!, $groupId: String!) {
  deleteDocumentGroup(entityId: $entityId, groupId: $groupId) {
    id
    groups {
      id
      name
    }
  }
}
```

#### 7. Add Document
```graphql
mutation AddDocument($entityId: String!, $groupId: String!, $document: DocumentRecordInput!) {
  addDocument(entityId: $entityId, groupId: $groupId, document: $document) {
    id
    entityId
    groups {
      id
      name
      documents {
        id
        title
        version
        date
        description
        url
        fileName
      }
    }
  }
}
```

**Example Variables:**
```json
{
  "entityId": "blanco-amos-dental-group",
  "groupId": "front-desk-forms",
  "document": {
    "id": "FD-999",
    "title": "New Patient Form",
    "version": "1.0",
    "date": "10/28/2025",
    "description": "Updated patient registration form",
    "url": "https://example.com/form.pdf",
    "fileName": "new-patient-form.pdf"
  }
}
```

#### 8. Update Document
```graphql
mutation UpdateDocument(
  $entityId: String!
  $groupId: String!
  $documentId: String!
  $document: DocumentRecordInput!
) {
  updateDocument(
    entityId: $entityId
    groupId: $groupId
    documentId: $documentId
    document: $document
  ) {
    id
    groups {
      id
      documents {
        id
        title
        version
      }
    }
  }
}
```

**Example Variables:**
```json
{
  "entityId": "blanco-amos-dental-group",
  "groupId": "front-desk-forms",
  "documentId": "FD-142",
  "document": {
    "id": "FD-142",
    "title": "Patient Welcome Packet (English) - Updated",
    "version": "2.4",
    "date": "10/28/2025",
    "description": "Latest version with new HIPAA compliance updates",
    "url": "#",
    "fileName": "welcome-packet-v2.4.pdf"
  }
}
```

#### 9. Delete Document
```graphql
mutation DeleteDocument($entityId: String!, $groupId: String!, $documentId: String!) {
  deleteDocument(entityId: $entityId, groupId: $groupId, documentId: $documentId) {
    id
    groups {
      id
      documents {
        id
        title
      }
    }
  }
}
```

**Example Variables:**
```json
{
  "entityId": "blanco-amos-dental-group",
  "groupId": "front-desk-forms",
  "documentId": "FD-142"
}
```

## Backend Components

### Model
- **File**: `src/models/Document.ts`
- **Mongoose Schema**: DocumentEntitySchema
- **Interfaces**: IDocumentEntity, IDocumentGroup, IDocumentRecord
- **Features**:
  - Unique entityId index
  - Nested document structure (Entity → Groups → Documents)
  - Timestamps (createdAt, updatedAt)

### GraphQL Type Definitions
- **File**: `src/graphql/typeDefs.ts`
- **Lines**: 117-140 (Types), 239-253 (Inputs), 342-344 (Queries), 406-415 (Mutations)

### Resolvers
- **File**: `src/graphql/resolvers.ts`
- **Query Resolvers**: Lines 165-182
  - `documentEntities`: Get all entities
  - `documentEntity`: Get single entity by entityId
- **Mutation Resolvers**: Lines 696-915
  - Entity CRUD: create, update, delete
  - Group CRUD: add, update, delete
  - Document CRUD: add, update, delete

### Seed Script
- **File**: `scripts/seed-documents.ts`
- **Command**: `npm run seed:documents`
- **Data**: 3 entities, 9 groups, 20 documents

## Usage in Frontend

### Example: Fetch All Documents
```typescript
import { useQuery, gql } from '@apollo/client';

const GET_DOCUMENT_ENTITIES = gql`
  query GetDocumentEntities {
    documentEntities {
      id
      entityId
      name
      groups {
        id
        name
        documents {
          id
          title
          version
          date
          description
          url
          fileName
        }
      }
    }
  }
`;

export default function DocumentsPage() {
  const { data, loading, error } = useQuery(GET_DOCUMENT_ENTITIES);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.documentEntities.map(entity => (
        <div key={entity.id}>
          <h2>{entity.name}</h2>
          {entity.groups.map(group => (
            <div key={group.id}>
              <h3>{group.name}</h3>
              <ul>
                {group.documents.map(doc => (
                  <li key={doc.id}>
                    {doc.title} v{doc.version}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Example: Add New Document
```typescript
import { useMutation, gql } from '@apollo/client';

const ADD_DOCUMENT = gql`
  mutation AddDocument($entityId: String!, $groupId: String!, $document: DocumentRecordInput!) {
    addDocument(entityId: $entityId, groupId: $groupId, document: $document) {
      id
      groups {
        id
        documents {
          id
          title
        }
      }
    }
  }
`;

function AddDocumentForm() {
  const [addDocument] = useMutation(ADD_DOCUMENT, {
    refetchQueries: ['GetDocumentEntities']
  });

  const handleSubmit = async (formData) => {
    await addDocument({
      variables: {
        entityId: 'blanco-amos-dental-group',
        groupId: 'front-desk-forms',
        document: {
          id: `FD-${Date.now()}`,
          title: formData.title,
          version: formData.version,
          date: new Date().toLocaleDateString(),
          description: formData.description,
          url: formData.url,
          fileName: formData.fileName
        }
      }
    });
  };

  // Form JSX here...
}
```

## Testing

### Via GraphQL Playground
1. Navigate to `http://localhost:3001/api/graphql`
2. Use the queries and mutations above
3. Check the results in the response panel

### Via MongoDB Compass
1. Connect to `mongodb://localhost:27017`
2. Database: `ontime_dental`
3. Collection: `documententities`
4. View seeded data

## Next Steps for Frontend Integration

1. ✅ Backend Complete
2. ⏳ Update `src/app/documents/page.tsx` to use GraphQL queries
3. ⏳ Replace mock data with `useQuery(GET_DOCUMENT_ENTITIES)`
4. ⏳ Implement document upload functionality (if needed)
5. ⏳ Add mutations for editing documents
6. ⏳ Add snackbar notifications (like tickets module)
7. ⏳ Add search/filter functionality

## API Endpoint
- **URL**: `http://localhost:3001/api/graphql`
- **Method**: POST
- **Headers**: `Content-Type: application/json`

---

**Status**: ✅ Backend 100% Complete and Tested  
**Last Updated**: October 28, 2025  
**Seeded Data**: 3 entities, 20 documents
