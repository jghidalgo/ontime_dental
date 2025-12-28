import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($unreadOnly: Boolean, $limit: Int, $offset: Int) {
    notifications(unreadOnly: $unreadOnly, limit: $limit, offset: $offset) {
      id
      title
      message
      readAt
      createdAt
    }
  }
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query GetUnreadNotificationCount {
    unreadNotificationCount
  }
`;
