import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import type { NextRequest } from 'next/server';
import typeDefs from '@/graphql/typeDefs';
import { resolvers } from '@/graphql/resolvers';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
});

const handler = startServerAndCreateNextHandler<NextRequest>(apolloServer, {
  context: async (req) => ({
    req
  })
});

export const GET = handler;
export const POST = handler;
