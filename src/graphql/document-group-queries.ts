import { gql } from '@apollo/client';

export const GET_DOCUMENT_GROUPS = gql`
  query GetDocumentGroups {
    documentGroups {
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

export const GET_ACTIVE_DOCUMENT_GROUPS = gql`
  query GetActiveDocumentGroups {
    activeDocumentGroups {
      id
      name
      description
      order
    }
  }
`;
