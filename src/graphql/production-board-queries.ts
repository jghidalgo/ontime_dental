import { gql } from '@apollo/client';

export const GET_PRODUCTION_BOARD_CASES = gql`
  query GetProductionBoardCases($companyId: ID!, $productionStage: String, $technicianId: String) {
    productionBoardCases(companyId: $companyId, productionStage: $productionStage, technicianId: $technicianId) {
      id
      caseId
      companyId
      patientId
      labId
      lab
      clinicId
      clinic
      patientFirstName
      patientLastName
      birthday
      reservationDate
      doctorId
      doctor
      procedure
      status
      productionStage
      category
      priority
      shadeGuide
      materialType
      notes
      toothNumbers
      estimatedCompletion
      actualCompletion
      technicianId
      technician
      qrCode
      qrCodeData
      createdAt
      updatedAt
    }
  }
`;
