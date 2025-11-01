import { gql } from '@apollo/client';

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: EmployeeCreateInput!) {
    createEmployee(input: $input) {
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

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: ID!, $input: EmployeeUpdateInput!) {
    updateEmployee(id: $id, input: $input) {
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

export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;
