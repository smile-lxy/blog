#!/usr/bin/env node
// Fetch latest GitHub Discussions comments and write to source/_data/recent_comments.json
// Usage: GITHUB_TOKEN=xxx node tools/fetch_comments.js

const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error('Missing GITHUB_TOKEN. Set env GITHUB_TOKEN and retry.');
  process.exit(1);
}

const OWNER = 'smile-lxy';
const REPO = 'blog-talk';
const LIMIT = 10;

const query = `
query ($owner: String!, $name: String!, $first: Int!) {
  repository(owner: $owner, name: $name) {
    discussions(first: $first, orderBy: { field: UPDATED_AT, direction: DESC }) {
      edges {
        node {
          id
          title
          url
          updatedAt
          comments(first: 1, orderBy: { field: UPDATED_AT, direction: DESC }) {
            edges {
              node {
                body
                createdAt
                author {
                  login
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

async function fetchComments() {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ query, variables: { owner: OWNER, name: REPO, first: LIMIT } })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  const edges = json.data?.repository?.discussions?.edges || [];
  const out = edges.map(e => {
    const n = e.node || {};
    const commentEdge = (n.comments && n.comments.edges && n.comments.edges[0]) || null;
    const comment = commentEdge ? commentEdge.node : null;
    return {
      title: n.title || '',
      url: n.url || '',
      updatedAt: n.updatedAt || '',
      commentBody: comment ? comment.body : '',
      commentCreatedAt: comment ? comment.createdAt : '',
      commentAuthor: comment && comment.author ? comment.author.login : ''
    };
  });

  const outDir = path.join(__dirname, '..', 'source', '_data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'recent_comments.json');
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', outFile);
}

// Node 18+ has fetch. If not, require node-fetch.
(async () => {
  try {
    if (typeof fetch === 'undefined') global.fetch = await (await import('node-fetch')).default;
  } catch (e) {
    // ignore
  }

  try {
    await fetchComments();
  } catch (err) {
    console.error(err);
    process.exit(2);
  }
})();
