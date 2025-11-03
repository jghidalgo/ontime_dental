import { gql } from '@apollo/client';

export const CREATE_PTO = gql`
  mutation CreatePTO($input: PTOCreateInput!) {
    createPTO(input: $input) {
      id
      employeeId
      companyId
      leaveType
      startDate
      endDate
      requestedDays
      status
      comment
      requestedBy
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PTO = gql`
  mutation UpdatePTO($id: ID!, $input: PTOUpdateInput!) {
    updatePTO(id: $id, input: $input) {
      id
      employeeId
      companyId
      leaveType
      startDate
      endDate
      requestedDays
      status
      comment
      reviewedBy
      reviewedAt
      createdAt
      updatedAt
    }
  }
`;

export const APPROVE_PTO = gql`
  mutation ApprovePTO($id: ID!, $reviewedBy: String!) {
    approvePTO(id: $id, reviewedBy: $reviewedBy) {
      id
      status
      reviewedBy
      reviewedAt
    }
  }
`;

export const REJECT_PTO = gql`
  mutation RejectPTO($id: ID!, $reviewedBy: String!) {
    rejectPTO(id: $id, reviewedBy: $reviewedBy) {
      id
      status
      reviewedBy
      reviewedAt
    }
  }
`;

export const DELETE_PTO = gql`
  mutation DeletePTO($id: ID!) {
    deletePTO(id: $id)
  }
`;
