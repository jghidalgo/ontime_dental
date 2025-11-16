import { gql } from '@apollo/client';

export const CREATE_DOCUMENT_GROUP = gql`
  mutation CreateDocumentGroup($input: DocumentGroupInput!) {
    createDocumentGroup(input: $input) {
      id
      name
      description
      isActive
      order
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_DOCUMENT_GROUP = gql`
  mutation UpdateDocumentGroup($id: ID!, $input: DocumentGroupInput!) {
    updateDocumentGroup(id: $id, input: $input) {
      id
      name
      description
      isActive
      order
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_DOCUMENT_GROUP = gql`
  mutation DeleteDocumentGroup($id: ID!) {
    deleteDocumentGroup(id: $id) {
      success
      message
    }
  }
`;

export const REORDER_DOCUMENT_GROUPS = gql`
  mutation ReorderDocumentGroups($groupIds: [ID!]!) {
    reorderDocumentGroups(groupIds: $groupIds) {
      id
      order
    }
  }
`;
