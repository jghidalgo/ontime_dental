'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { LanguageProvider } from '@/lib/i18n';
import { LanguageToggle } from '@/components/language-toggle';

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

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ApolloProvider client={client}>
      <LanguageProvider>
        <LanguageToggle />
        {children}
      </LanguageProvider>
    </ApolloProvider>
  );
}
