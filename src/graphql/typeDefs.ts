import { gql } from 'graphql-tag';

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    health: String!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
  }
`;

export default typeDefs;
