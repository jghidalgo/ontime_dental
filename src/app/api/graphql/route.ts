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

export async function GET(request: NextRequest): Promise<Response> {
  return (await handler(request)) as unknown as Response;
}

export async function POST(request: NextRequest): Promise<Response> {
  return (await handler(request)) as unknown as Response;
}
