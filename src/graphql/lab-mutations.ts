import { gql } from '@apollo/client';

export const CREATE_LAB_CASE = gql`
  mutation CreateLabCase($input: LabCaseInput!) {
    createLabCase(input: $input) {
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

export const UPDATE_LAB_CASE = gql`
  mutation UpdateLabCase($id: ID!, $input: LabCaseUpdateInput!) {
    updateLabCase(id: $id, input: $input) {
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

export const DELETE_LAB_CASE = gql`
  mutation DeleteLabCase($id: ID!) {
    deleteLabCase(id: $id)
  }
`;
