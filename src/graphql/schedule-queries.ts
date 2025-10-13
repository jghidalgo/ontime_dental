import { gql } from '@apollo/client';

export const GET_FRONT_DESK_SCHEDULES = gql`
  query GetFrontDeskSchedules {
    frontDeskSchedules {
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
  query GetDoctorSchedules {
    doctorSchedules {
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
