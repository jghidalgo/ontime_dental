import { gql } from '@apollo/client';

export const GET_BILLING_CASES = gql`
  query GetBillingCases($companyId: ID!, $startDate: String, $endDate: String) {
    billingCases(companyId: $companyId, startDate: $startDate, endDate: $endDate) {
      id
      caseId
      companyId
      clinic
      clinicId
      procedure
      price
      reservationDate
      actualCompletion
      status
      createdAt
    }
  }
`;
