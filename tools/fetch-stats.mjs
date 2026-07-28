const ENDPOINT = 'https://api.github.com/graphql';
const TOP_LANGUAGES = 8;

const QUERY = `query($login: String!, $cursor: String) {
  user(login: $login) {
    followers { totalCount }
    contributionsCollection { contributionCalendar { totalContributions } }
    repositories(first: 100, after: $cursor, isFork: false, privacy: PUBLIC, ownerAffiliations: OWNER) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        name
        stargazerCount
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name } }
        }
      }
    }
  }
}`;

async function queryPage({ token, login, cursor, fetchImpl }) {
  const response = await fetchImpl(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'kpanuragh-profile-stats',
    },
    body: JSON.stringify({ query: QUERY, variables: { login, cursor } }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`GitHub GraphQL error: ${payload.errors.map((e) => e.message).join('; ')}`);
  }
  if (!payload.data?.user) {
    throw new Error(`GitHub GraphQL returned no user for login "${login}"`);
  }
  return payload.data.user;
}

function rankLanguages(byteTotals) {
  const entries = [...byteTotals.entries()]
    .map(([name, bytes]) => ({ name, bytes }))
    .sort((a, b) => (b.bytes - a.bytes) || a.name.localeCompare(b.name));

  const top = entries.slice(0, TOP_LANGUAGES);
  const restBytes = entries.slice(TOP_LANGUAGES).reduce((sum, entry) => sum + entry.bytes, 0);
  if (restBytes > 0) {
    top.push({ name: 'other', bytes: restBytes });
  }

  const total = top.reduce((sum, entry) => sum + entry.bytes, 0);
  return top.map((entry) => ({ ...entry, share: total === 0 ? 0 : entry.bytes / total }));
}

export async function fetchStats({ token, login, fetchImpl = fetch }) {
  if (!token) {
    throw new Error('fetchStats requires a GitHub token');
  }

  const byteTotals = new Map();
  let stars = 0;
  let repos = 0;
  let followers = 0;
  let contributions = 0;
  let cursor = null;

  for (;;) {
    const user = await queryPage({ token, login, cursor, fetchImpl });
    followers = user.followers.totalCount;
    contributions = user.contributionsCollection.contributionCalendar.totalContributions;

    for (const repo of user.repositories.nodes) {
      repos += 1;
      stars += repo.stargazerCount;
      for (const edge of repo.languages?.edges ?? []) {
        const name = edge.node.name;
        byteTotals.set(name, (byteTotals.get(name) ?? 0) + edge.size);
      }
    }

    if (!user.repositories.pageInfo.hasNextPage) break;
    cursor = user.repositories.pageInfo.endCursor;
  }

  return { login, repos, stars, followers, contributions, languages: rankLanguages(byteTotals) };
}
