import { gql } from '@apollo/client';

export const GET_FRONT_DESK_SCHEDULES = gql`
  query GetFrontDeskSchedules($companyId: ID) {
    frontDeskSchedules(companyId: $companyId) {
      id
      positionId
      clinicId
      employee {
        id
        name
      }
    }
  }
`;

export const GET_DOCTOR_SCHEDULES = gql`
  query GetDoctorSchedules($companyId: ID) {
    doctorSchedules(companyId: $companyId) {
      id
      dayId
      clinicId
      doctor {
        id
        name
        shift
      }
    }
  }
`;
