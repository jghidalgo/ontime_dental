import { gql } from '@apollo/client';

export const GET_INSURANCES = gql`
  query GetInsurances($companyId: ID, $isActive: Boolean) {
    insurances(companyId: $companyId, isActive: $isActive) {
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

export const GET_INSURANCE = gql`
  query GetInsurance($id: ID!) {
    insurance(id: $id) {
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

export const GET_INSURANCE_BY_INSURER_ID = gql`
  query GetInsuranceByInsurerId($insurerId: String!, $companyId: ID!) {
    insuranceByInsurerId(insurerId: $insurerId, companyId: $companyId) {
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
