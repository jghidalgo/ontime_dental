import { gql } from '@apollo/client';

export const UPDATE_FRONT_DESK_SCHEDULE = gql`
  mutation UpdateFrontDeskSchedule($positionId: String!, $clinicId: String!, $companyId: String!, $employee: EmployeeInput) {
    updateFrontDeskSchedule(positionId: $positionId, clinicId: $clinicId, companyId: $companyId, employee: $employee) {
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
  mutation UpdateDoctorSchedule($dayId: String!, $clinicId: String!, $companyId: String!, $doctor: DoctorAssignmentInput) {
    updateDoctorSchedule(dayId: $dayId, clinicId: $clinicId, companyId: $companyId, doctor: $doctor) {
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
    $companyId: String!
  ) {
    swapFrontDeskAssignments(
      sourcePositionId: $sourcePositionId
      sourceClinicId: $sourceClinicId
      targetPositionId: $targetPositionId
      targetClinicId: $targetClinicId
      companyId: $companyId
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
    $companyId: String!
  ) {
    swapDoctorAssignments(
      sourceDayId: $sourceDayId
      sourceClinicId: $sourceClinicId
      targetDayId: $targetDayId
      targetClinicId: $targetClinicId
      companyId: $companyId
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
