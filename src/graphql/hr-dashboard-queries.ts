import { gql } from '@apollo/client';

export const GET_EMPLOYEE_LOCATION_DISTRIBUTION = gql`
  query GetEmployeeLocationDistribution($companyId: ID) {
    employeeLocationDistribution(companyId: $companyId) {
      location
      count
      color
    }
  }
`;

export const GET_HR_DASHBOARD_STATS = gql`
  query GetHRDashboardStats($companyId: ID) {
    employees(companyId: $companyId, status: "active") {
      id
      location
      department
    }
    ptos(companyId: $companyId) {
      id
      status
      startDate
      endDate
    }
    employeeLocationDistribution(companyId: $companyId) {
      location
      count
      color
    }
  }
`;
