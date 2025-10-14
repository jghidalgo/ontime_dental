import { gql } from '@apollo/client';

export const CREATE_TICKET = gql`
  mutation CreateTicket($input: TicketInput!) {
    createTicket(input: $input) {
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

export const UPDATE_TICKET = gql`
  mutation UpdateTicket($id: ID!, $input: TicketInput!) {
    updateTicket(id: $id, input: $input) {
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

export const DELETE_TICKET = gql`
  mutation DeleteTicket($id: ID!) {
    deleteTicket(id: $id)
  }
`;
