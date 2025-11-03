import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers($companyId: ID) {
    users(companyId: $companyId) {
      id
      name
      email
      role
      companyId
      phone
      position
      department
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role
      companyId
      phone
      position
      department
      isActive
      createdAt
      updatedAt
    }
  }
`;
