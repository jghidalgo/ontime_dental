'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { LanguageProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import { clearUserSession } from '@/lib/permissions';

const httpLink = createHttpLink({
  uri: '/api/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ontime.authToken') : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  const graphQlMessages = (graphQLErrors ?? []).map((err) => String(err.message ?? '')).filter(Boolean);
  const networkMessage = networkError ? String(networkError.message ?? '') : '';
  const combined = [...graphQlMessages, networkMessage].join(' | ').toLowerCase();

  const isAuthError =
    combined.includes('jwt expired') ||
    combined.includes('invalid token') ||
    combined.includes('unauthorized') ||
    combined.includes('not authenticated');

  if (!isAuthError) return;

  if (typeof window !== 'undefined') {
    clearUserSession();
    if (window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  }
});

const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Cache tickets for 5 minutes
          tickets: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          // Cache dashboard data for 30 seconds
          dashboardData: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          // Cache schedules
          frontDeskSchedules: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          doctorSchedules: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          // Cache directory entries
          directoryEntries: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          // Cache document entities
          documentEntities: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}
