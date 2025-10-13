import { gql } from '@apollo/client';

export const UPDATE_DIRECTORY_ENTRY = gql`
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
`;

export const DELETE_DIRECTORY_ENTRY = gql`
  mutation DeleteDirectoryEntry($id: ID!) {
    deleteDirectoryEntry(id: $id)
  }
`;

export const REORDER_DIRECTORY_ENTRIES = gql`
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
`;

export const CREATE_DIRECTORY_ENTRY = gql`
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
`;
