import { gql } from '@apollo/client';

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    dashboardData {
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
