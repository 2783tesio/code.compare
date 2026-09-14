// Sample content per language — only loaded when user clicks "Sample"
const SAMPLES = {
  json: {
    original: `{
  "name": "code-compare",
  "version": "1.0.0",
  "description": "A simple code comparison tool",
  "main": "index.html",
  "author": "developer",
  "license": "MIT",
  "dependencies": {
    "lodash": "^4.17.21"
  }
}`,
    modified: `{
  "name": "code-compare",
  "version": "2.0.0",
  "description": "A powerful code comparison and diff tool",
  "main": "index.html",
  "author": "developer",
  "license": "Apache-2.0",
  "dependencies": {
    "lodash": "^4.17.21",
    "dayjs": "^1.11.10"
  },
  "keywords": ["diff", "compare", "code"]
}`,
  },

  html: {
    original: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>Welcome</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main>
    <p>Hello, world!</p>
  </main>
</body>
</html>`,
    modified: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Awesome Page</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="theme.css">
</head>
<body>
  <header class="site-header">
    <h1>Welcome to Code Compare</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/docs">Docs</a>
    </nav>
  </header>
  <main>
    <p>Hello, world! Start comparing your code now.</p>
    <button id="get-started">Get Started</button>
  </main>
  <footer>
    <p>&copy; 2024 Code Compare</p>
  </footer>
</body>
</html>`,
  },

  javascript: {
    original: `function fetchUsers() {
  return fetch('/api/users')
    .then(response => response.json())
    .then(data => {
      console.log('Users:', data);
      return data;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

const result = fetchUsers();`,
    modified: `async function fetchUsers(options = {}) {
  const { page = 1, limit = 20 } = options;

  try {
    const response = await fetch(
      \`/api/users?page=\${page}&limit=\${limit}\`
    );

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }

    const data = await response.json();
    console.log(\`Users (page \${page}):\`, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
}

const result = await fetchUsers({ page: 1, limit: 10 });`,
  },

  python: {
    original: `def process_data(items):
    result = []
    for item in items:
        if item['status'] == 'active':
            result.append({
                'id': item['id'],
                'name': item['name'].upper(),
                'value': item['value'] * 2
            })
    return result

data = process_data(raw_items)
print(f"Processed {len(data)} items")`,
    modified: `from dataclasses import dataclass
from typing import List

@dataclass
class ProcessedItem:
    id: int
    name: str
    value: float

def process_data(items: list, *, multiplier: float = 2.0) -> List[ProcessedItem]:
    """Process items, keeping only active ones."""
    return [
        ProcessedItem(
            id=item['id'],
            name=item['name'].upper(),
            value=item['value'] * multiplier
        )
        for item in items
        if item['status'] == 'active'
    ]

data = process_data(raw_items, multiplier=3.0)
print(f"Processed {len(data)} items")`,
  },

  css: {
    original: `.container {
  width: 960px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
}

.card h2 {
  font-size: 18px;
  color: #333;
}`,
    modified: `.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
  container-type: inline-size;
}

.card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card h2 {
  font-size: 18px;
  color: #1a1a2e;
  font-weight: 600;
}`,
  },

  typescript: {
    original: `function getUser(id: number) {
  const user = users.find(u => u.id === id);
  if (user) {
    return user;
  }
  return null;
}

interface User {
  id: number;
  name: string;
  email: string;
}`,
    modified: `interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

type UserResult = { ok: true; user: User } | { ok: false; error: string };

function getUser(id: number): UserResult {
  const user = users.find(u => u.id === id);

  if (!user) {
    return { ok: false, error: \`User \${id} not found\` };
  }

  return { ok: true, user };
}`,
  },

  sql: {
    original: `SELECT u.name, u.email, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.name, u.email
ORDER BY order_count DESC;`,
    modified: `SELECT
  u.name,
  u.email,
  COUNT(o.id) AS order_count,
  SUM(o.total) AS total_spent,
  MAX(o.created_at) AS last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
  AND u.created_at >= '2024-01-01'
GROUP BY u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 100;`,
  },

  xml: {
    original: `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="1">
    <title>Code Complete</title>
    <author>Steve McConnell</author>
    <year>2004</year>
  </book>
  <book id="2">
    <title>Clean Code</title>
    <author>Robert C. Martin</author>
    <year>2008</year>
  </book>
</catalog>`,
    modified: `<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns:dc="http://purl.org/dc/elements/1.1/">
  <book id="1" category="software">
    <title>Code Complete</title>
    <author>Steve McConnell</author>
    <year>2004</year>
    <dc:rating>4.5</dc:rating>
  </book>
  <book id="2" category="software">
    <title>Clean Code</title>
    <author>Robert C. Martin</author>
    <year>2008</year>
    <dc:rating>4.7</dc:rating>
  </book>
  <book id="3" category="algorithms">
    <title>Introduction to Algorithms</title>
    <author>Thomas H. Cormen</author>
    <year>2009</year>
    <dc:rating>4.3</dc:rating>
  </book>
</catalog>`,
  },

  plaintext: {
    original: `Meeting Notes - Q3 Planning
Date: August 15, 2024
Attendees: Alice, Bob, Charlie

Agenda:
1. Review Q2 results
2. Set Q3 goals
3. Budget allocation

Action Items:
- Alice: Prepare Q2 report by Friday
- Bob: Draft Q3 roadmap
- Charlie: Review hiring pipeline`,
    modified: `Meeting Notes - Q3 Planning (Revised)
Date: August 15, 2024
Attendees: Alice, Bob, Charlie, Diana

Agenda:
1. Review Q2 results
2. Set Q3 goals
3. Budget allocation
4. Team expansion plan

Action Items:
- Alice: Prepare Q2 report by Friday
- Bob: Draft Q3 roadmap by next Monday
- Charlie: Review hiring pipeline
- Diana: Set up new team onboarding process

Next meeting: August 22, 2024`,
  },

  yaml: {
    original: `name: my-app
version: "1.0"

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret`,
    modified: `name: my-app
version: "2.0"

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://db:5432/myapp
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:`,
  },

  markdown: {
    original: `# Project README

A simple project.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

Run the app:

\`\`\`bash
npm start
\`\`\``,
    modified: `# Project README

A powerful code comparison tool built with Monaco Editor.

## Features

- Side-by-side diff view
- Syntax highlighting for 15+ languages
- Dark theme UI

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

Run the app:

\`\`\`bash
npm start
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT`,
  },
};

export default SAMPLES;
