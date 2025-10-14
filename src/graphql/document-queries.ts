import { gql } from '@apollo/client';

export const GET_DOCUMENT_ENTITIES = gql`
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

export const GET_DOCUMENT_ENTITY = gql`
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
`;
