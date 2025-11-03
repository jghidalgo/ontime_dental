import { gql } from '@apollo/client';

export const GET_EMPLOYEES = gql`
  query GetEmployees(
    $companyId: ID
    $search: String
    $location: String
    $position: String
    $status: String
    $limit: Int
    $offset: Int
  ) {
    employees(
      companyId: $companyId
      search: $search
      location: $location
      position: $position
      status: $status
      limit: $limit
      offset: $offset
    ) {
      id
      employeeId
      userId
      companyId
      name
      joined
      dateOfBirth
      phone
      position
      location
      email
      department
      status
      emergencyContact {
        name
        relationship
        phone
      }
      ptoAllowance
      ptoUsed
      ptoAvailable
      ptoYear
      createdAt
      updatedAt
    }
  }
`;

export const GET_EMPLOYEE = gql`
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      id
      employeeId
      companyId
      name
      joined
      dateOfBirth
      phone
      position
      location
      email
      department
      status
      emergencyContact {
        name
        relationship
        phone
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_EMPLOYEE_BY_EMPLOYEE_ID = gql`
  query GetEmployeeByEmployeeId($employeeId: String!, $companyId: ID) {
    employeeByEmployeeId(employeeId: $employeeId, companyId: $companyId) {
      id
      employeeId
      companyId
      name
      joined
      dateOfBirth
      phone
      position
      location
      email
      department
      status
      emergencyContact {
        name
        relationship
        phone
      }
      createdAt
      updatedAt
    }
  }
`;
