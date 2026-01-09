import { gql } from '@apollo/client';

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData($companyId: ID) {
    dashboardData(companyId: $companyId) {
      metrics {
        label
        value
        delta
        trend
      }
      upcomingAppointments {
        time
        patient
        treatment
        practitioner
      }
      priorityTasks {
        id
        kind
        title
        description
        badge
        timestamp
      }
      revenueTrend {
        month
        value
      }
      teamActivity {
        id
        title
        timestamp
        owner
      }
      announcements {
        title
        description
        badge
      }
    }
  }
`;
