import { gql } from '@apollo/client';

export const GET_ALL_DIRECTORY_DATA = gql`
  query GetAllDirectoryData {
    allDirectoryData {
      id
      entityId
      name
      corporate {
        id
        location
        phone
        extension
        department
        employee
      }
      frontdesk {
        id
        location
        phone
        extension
        department
        employee
      }
      offices {
        id
        location
        phone
        extension
        department
        employee
      }
    }
  }
`;

export const GET_DIRECTORY_ENTITY_WITH_ENTRIES = gql`
  query GetDirectoryEntityWithEntries($entityId: String!) {
    directoryEntityWithEntries(entityId: $entityId) {
      id
      entityId
      name
      corporate {
        id
        location
        phone
        extension
        department
        employee
      }
      frontdesk {
        id
        location
        phone
        extension
        department
        employee
      }
      offices {
        id
        location
        phone
        extension
        department
        employee
      }
    }
  }
`;

export const GET_CLINIC_LOCATIONS = gql`
  query GetClinicLocations($companyId: ID) {
    clinicLocations(companyId: $companyId) {
      id
      companyId
      companyName
      headquarters
      description
      mapCenter {
        lat
        lng
      }
      clinics {
        clinicId
        name
        address
        city
        zip
        phone
        email
        hours
        coordinates {
          lat
          lng
        }
      }
    }
  }
`;

export const GET_CLINIC_LOCATION = gql`
  query GetClinicLocation($companyId: String!) {
    clinicLocation(companyId: $companyId) {
      id
      companyId
      companyName
      headquarters
      description
      mapCenter {
        lat
        lng
      }
      clinics {
        clinicId
        name
        address
        city
        zip
        phone
        email
        hours
        coordinates {
          lat
          lng
        }
      }
    }
  }
`;
