# jg-crm-pw-agents-poc
Proof of concept for end-to-end testing of a sample CRM application using **Playwright with TypeScript** and **AI agents** (Planner, Generator, Healer), with changes delivered through GitHub branches and pull requests.

## Goals

- Build a Playwright + TypeScript E2E test project for a sample CRM app
- Use AI agents to plan, generate, and heal tests
- Commit changes and open pull requests on GitHub
- Run the suite in CI with reports and traces

## Tech stack

- [Playwright](https://playwright.dev) with TypeScript
- Playwright Test Agents (Planner, Generator, Healer) via the Playwright MCP server
- Node.js and npm
- Git and GitHub (GitHub CLI optional)
- GitHub Actions for CI

## Prerequisites

- Node.js 18 or later
- Git
- VS Code (or another AI client that supports Playwright agents, such as Claude Code)
- A GitHub account
- Access to the CRM application under test (see [Configuration](#configuration))

## Getting started

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/jg-crm-pw-agents-poc.git
cd jg-crm-pw-agents-poc

# 2. Install dependencies and browsers
npm install
npx playwright install

# 3. Set up environment variables
cp .env.example .env
# then edit .env with your CRM URL and test credentials
```

### Setting up from scratch

If you are bootstrapping this project in an empty repo:

```bash
npm init playwright@latest        # choose TypeScript, tests folder, GitHub Actions
npx playwright init-agents --loop=vscode   # or --loop=claude
```

## Configuration

Create a `.env` file in the project root (never commit it):

```
BASE_URL=https://your-crm-url.example.com
CRM_USERNAME=your-test-user
CRM_PASSWORD=your-test-password
```

Load these in `playwright.config.ts` and use `baseURL: process.env.BASE_URL`.

## Project structure

```
.
├── .github/workflows/     # CI workflow (Playwright tests, report artifacts)
├── pages/                 # Page Object Models (Login, Contacts, Leads, Deals)
├── fixtures/              # Auth setup (storageState) and test data helpers
├── tests/                 # E2E test files
├── specs/                 # Markdown test plans produced by the Planner agent
├── playwright.config.ts   # Playwright configuration
├── .env.example           # Sample environment variables
└── README.md
```

## Working with the AI agents

The agents are scaffolded by `npx playwright init-agents` and run from your AI client.

1. **Planner** explores the CRM in a browser and writes a test plan to `specs/`.
2. **Generator** converts the plan into Playwright TypeScript tests in `tests/`.
3. **Healer** runs failing tests, inspects the UI, and fixes selectors, waits, or assertions.

Typical flow:

1. Ask the Planner to explore a feature (for example, "create and edit a contact").
2. Review and adjust the plan in `specs/`.
3. Ask the Generator to produce tests from the plan.
4. Run the tests; ask the Healer to fix any failures.
5. Review the diff, then commit and open a PR.

> Agent output is a starting point. Always review generated tests before merging.

## Running tests

```bash
npx playwright test                    # run all tests headless
npx playwright test --headed           # run with a visible browser
npx playwright test tests/contacts.spec.ts   # run one file
npx playwright test --ui               # interactive UI mode
npx playwright show-report             # open the HTML report
npx playwright show-trace <trace.zip>  # inspect a trace
```

## Git workflow

```bash
git checkout -b feature/<short-description>
git add .
git commit -m "test: add contact creation flow"
git push -u origin feature/<short-description>
gh pr create --fill                    # or use "Create Pull Request" in GitHub / VS Code
```

Conventions:

- One feature or flow per branch
- Commit messages follow `type: summary` (`test:`, `fix:`, `chore:`, `docs:`)
- All changes go through a pull request

## CI

GitHub Actions runs the Playwright suite on every push and pull request. Test reports and traces are uploaded as workflow artifacts. See `.github/workflows/playwright.yml`.

## Roadmap

- [ ] Create the GitHub repository and push the initial Playwright setup
- [ ] Initialize the Planner, Generator, and Healer agents
- [ ] Add login and auth fixtures
- [ ] Cover core CRM flows: contacts, leads, deals, search and filter
- [ ] Add CI workflow and report artifacts
- [ ] Automate commit and PR creation after the Healer passes

## Notes

- This is a proof of concept, not production test coverage.
- Do not commit credentials, `.env`, or `storageState` files.
