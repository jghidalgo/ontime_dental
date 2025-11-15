import { gql } from '@apollo/client';

export const GET_LABORATORIES = gql`
  query GetLaboratories {
    laboratories {
      id
      name
      shortName
      contactPerson
      phone
      email
      address
    }
  }
`;

export const GET_LAB_CASES = gql`
  query GetLabCases($companyId: ID) {
    labCases(companyId: $companyId) {
      id
      caseId
      companyId
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
      qrCode
      qrCodeData
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
      qrCode
      qrCodeData
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
      qrCode
      qrCodeData
      createdAt
      updatedAt
    }
  }
`;
