import { gql } from '@apollo/client';

export const GET_LAB_CASES = gql`
  query GetLabCases {
    labCases {
      id
      caseId
      lab
      clinic
      patientFirstName
      patientLastName
      birthday
      reservationDate
      doctor
      procedure
      status
      category
      priority
      shadeGuide
      materialType
      notes
      toothNumbers
      estimatedCompletion
      actualCompletion
      technician
      createdAt
      updatedAt
    }
  }
`;

export const GET_LAB_CASE = gql`
  query GetLabCase($id: ID!) {
    labCase(id: $id) {
      id
      caseId
      lab
      clinic
      patientFirstName
      patientLastName
      birthday
      reservationDate
      doctor
      procedure
      status
      category
      priority
      shadeGuide
      materialType
      notes
      toothNumbers
      estimatedCompletion
      actualCompletion
      technician
      createdAt
      updatedAt
    }
  }
`;

export const GET_LAB_CASE_BY_NUMBER = gql`
  query GetLabCaseByNumber($caseId: String!) {
    labCaseByNumber(caseId: $caseId) {
      id
      caseId
      lab
      clinic
      patientFirstName
      patientLastName
      birthday
      reservationDate
      doctor
      procedure
      status
      category
      priority
      shadeGuide
      materialType
      notes
      toothNumbers
      estimatedCompletion
      actualCompletion
      technician
      createdAt
      updatedAt
    }
  }
`;
