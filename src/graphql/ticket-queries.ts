import { gql } from '@apollo/client';

export const GET_TICKETS = gql`
  query GetTickets {
    tickets {
      id
      subject
      requester
      location
      channel
      category
      description
      status
      priority
      createdAt
      dueDate
      updates {
        timestamp
        message
        user
      }
      satisfaction
    }
  }
`;

export const GET_TICKET = gql`
  query GetTicket($id: ID!) {
    ticket(id: $id) {
      id
      subject
      requester
      location
      channel
      category
      description
      status
      priority
      createdAt
      dueDate
      updates {
        timestamp
        message
        user
      }
      satisfaction
    }
  }
`;
