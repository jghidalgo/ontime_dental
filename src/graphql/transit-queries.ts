import { gql } from '@apollo/client';

export const GET_TRANSIT_CASES = gql`
  query GetTransitCases($companyId: ID!, $transitStatus: String) {
    transitCases(companyId: $companyId, transitStatus: $transitStatus) {
      id
      caseId
      companyId
      clinic
      clinicId
      lab
      patientFirstName
      patientLastName
      procedure
      priority
      status
      transitStatus
      courierService
      trackingNumber
      pickupDate
      estimatedDelivery
      actualDelivery
      routeId
      currentLocation
      deliveryNotes
      signedBy
      transitHistory {
        timestamp
        location
        status
        notes
      }
      createdAt
    }
  }
`;

export const GET_TRANSIT_ROUTES = gql`
  query GetTransitRoutes($companyId: ID!) {
    transitRoutes(companyId: $companyId) {
      routeId
      companyId
      routeName
      region
      totalCases
      clinics
      estimatedDeparture
      estimatedArrival
      status
      courierService
      cases {
        id
        caseId
        clinic
        procedure
        priority
        estimatedDelivery
        currentLocation
        transitStatus
      }
    }
  }
`;

export const UPDATE_TRANSIT_STATUS = gql`
  mutation UpdateTransitStatus($id: ID!, $transitStatus: String!, $location: String, $notes: String) {
    updateTransitStatus(id: $id, transitStatus: $transitStatus, location: $location, notes: $notes) {
      id
      caseId
      transitStatus
      currentLocation
      actualDelivery
      status
      transitHistory {
        timestamp
        location
        status
        notes
      }
    }
  }
`;
