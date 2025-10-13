import { gql } from '@apollo/client';

export const UPDATE_FRONT_DESK_SCHEDULE = gql`
  mutation UpdateFrontDeskSchedule($positionId: String!, $clinicId: String!, $employee: EmployeeInput) {
    updateFrontDeskSchedule(positionId: $positionId, clinicId: $clinicId, employee: $employee) {
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

export const UPDATE_DOCTOR_SCHEDULE = gql`
  mutation UpdateDoctorSchedule($dayId: String!, $clinicId: String!, $doctor: DoctorAssignmentInput) {
    updateDoctorSchedule(dayId: $dayId, clinicId: $clinicId, doctor: $doctor) {
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

export const SWAP_FRONT_DESK_ASSIGNMENTS = gql`
  mutation SwapFrontDeskAssignments(
    $sourcePositionId: String!
    $sourceClinicId: String!
    $targetPositionId: String!
    $targetClinicId: String!
  ) {
    swapFrontDeskAssignments(
      sourcePositionId: $sourcePositionId
      sourceClinicId: $sourceClinicId
      targetPositionId: $targetPositionId
      targetClinicId: $targetClinicId
    ) {
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

export const SWAP_DOCTOR_ASSIGNMENTS = gql`
  mutation SwapDoctorAssignments(
    $sourceDayId: String!
    $sourceClinicId: String!
    $targetDayId: String!
    $targetClinicId: String!
  ) {
    swapDoctorAssignments(
      sourceDayId: $sourceDayId
      sourceClinicId: $sourceClinicId
      targetDayId: $targetDayId
      targetClinicId: $targetClinicId
    ) {
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
