import { gql } from '@apollo/client';

export const GET_EMPLOYEES = gql`
  query GetEmployees(
    $search: String
    $location: String
    $position: String
    $status: String
    $limit: Int
    $offset: Int
  ) {
    employees(
      search: $search
      location: $location
      position: $position
      status: $status
      limit: $limit
      offset: $offset
    ) {
      id
      employeeId
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

export const GET_EMPLOYEE = gql`
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      id
      employeeId
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
  query GetEmployeeByEmployeeId($employeeId: String!) {
    employeeByEmployeeId(employeeId: $employeeId) {
      id
      employeeId
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
