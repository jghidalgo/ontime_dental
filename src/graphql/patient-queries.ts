import { gql } from '@apollo/client';

export const GET_PATIENTS = gql`
  query GetPatients($companyId: ID) {
    patients(companyId: $companyId) {
      id
      firstName
      lastName
      email
      phone
      birthday
      address
      city
      state
      zip
      insuranceProvider
      insuranceNumber
      notes
      companyId
      createdAt
      updatedAt
    }
  }
`;

export const GET_PATIENT = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      firstName
      lastName
      email
      phone
      birthday
      address
      city
      state
      zip
      insuranceProvider
      insuranceNumber
      notes
      companyId
      createdAt
      updatedAt
    }
  }
`;

export const GET_LAB_CASES = gql`
  query GetLabCases($companyId: ID) {
    labCases(companyId: $companyId) {
      id
      caseId
      patientId
      lab
      clinic
      doctor
      procedure
      status
      createdAt
      updatedAt
    }
  }
`;
