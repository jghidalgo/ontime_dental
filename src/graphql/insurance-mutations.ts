import { gql } from '@apollo/client';

export const CREATE_INSURANCE = gql`
  mutation CreateInsurance($input: InsuranceInput!) {
    createInsurance(input: $input) {
      id
      insurerId
      name
      companyId
      contactName
      phone
      email
      website
      address
      city
      state
      zip
      policyPrefix
      notes
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_INSURANCE = gql`
  mutation UpdateInsurance($id: ID!, $input: InsuranceUpdateInput!) {
    updateInsurance(id: $id, input: $input) {
      id
      insurerId
      name
      companyId
      contactName
      phone
      email
      website
      address
      city
      state
      zip
      policyPrefix
      notes
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_INSURANCE = gql`
  mutation DeleteInsurance($id: ID!) {
    deleteInsurance(id: $id)
  }
`;
