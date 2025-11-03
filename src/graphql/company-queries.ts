import { gql } from '@apollo/client';

export const GET_COMPANIES = gql`
  query GetCompanies {
    companies {
      id
      name
      shortName
      location
      isActive
    }
  }
`;
