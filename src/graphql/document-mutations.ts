import { gql } from '@apollo/client';

export const UPDATE_DOCUMENT = gql`
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

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument(
    $entityId: String!
    $groupId: String!
    $documentId: String!
  ) {
    deleteDocument(
      entityId: $entityId
      groupId: $groupId
      documentId: $documentId
    ) {
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

export const ADD_DOCUMENT = gql`
  mutation AddDocument(
    $entityId: String!
    $groupId: String!
    $document: DocumentRecordInput!
  ) {
    addDocument(
      entityId: $entityId
      groupId: $groupId
      document: $document
    ) {
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

export const ADD_DOCUMENT_GROUP = gql`
  mutation AddDocumentGroup(
    $entityId: String!
    $groupId: String!
    $groupName: String!
  ) {
    addDocumentGroup(
      entityId: $entityId
      groupId: $groupId
      groupName: $groupName
    ) {
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

export const CREATE_DOCUMENT_ENTITY = gql`
  mutation CreateDocumentEntity(
    $entityId: String!
    $name: String!
  ) {
    createDocumentEntity(
      entityId: $entityId
      name: $name
    ) {
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
