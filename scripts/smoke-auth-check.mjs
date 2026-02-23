const gql = async (query, variables = {}, headers = {}) => {
  const response = await fetch('http://localhost:3000/api/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
};

const run = async () => {
  const protectedQuery = 'query { unreadNotificationCount }';
  const email = process.env.SMOKE_EMAIL;
  const password = process.env.SMOKE_PASSWORD;

  if (!email || !password) {
    console.error('Please set SMOKE_EMAIL and SMOKE_PASSWORD environment variables before running this script.');
    process.exit(1);
  }

  const withoutAuth = await gql(protectedQuery);
  console.log('withoutAuth:', JSON.stringify(withoutAuth));

  const login = await gql(
    'mutation ($email: String!, $password: String!) { login(email: $email, password: $password) { token user { id email role } } }',
    {
      email,
      password,
    }
  );

  if (login.errors || !login?.data?.login?.token) {
    console.error('loginError:', JSON.stringify(login));
    process.exit(1);
  }

  const token = login.data.login.token;
  console.log('loginUser:', login.data.login.user.email, login.data.login.user.role);

  const withAuth = await gql(protectedQuery, {}, { authorization: `Bearer ${token}` });
  console.log('withAuth:', JSON.stringify(withAuth));
};

run().catch((error) => {
  console.error('smokeCheckError:', error);
  process.exit(1);
});
