import { gql } from '@apollo/client';

export const GET_PTOS = gql`
  query GetPTOs($employeeId: String, $companyId: ID, $status: String) {
    ptos(employeeId: $employeeId, companyId: $companyId, status: $status) {
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
      reviewedBy
      reviewedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_PTO = gql`
  query GetPTO($id: ID!) {
    pto(id: $id) {
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
      reviewedBy
      reviewedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_EMPLOYEE_PTO_BALANCE = gql`
  query GetEmployeePTOBalance($employeeId: String!) {
    employeePTOBalance(employeeId: $employeeId) {
      id
      employeeId
      name
      ptoAllowance
      ptoUsed
      ptoAvailable
      ptoYear
    }
  }
`;
