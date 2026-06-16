# Connectors-Automation-Playwright

End-to-end Playwright automation framework for Simpplr Enterprise Search Connectors.

## Setup

```bash
npm install
npm run install:browsers
cp .env.example .env
```

Fill in credentials in `.env` (never commit `.env`).

## Run tests

```bash
npm run test:connectors:smoke
npm run test:connectors:e2e
npm run test:app-manager
```

## Structure

- `tests/` — smoke, e2e, regression specs
- `src/pages/` — page objects
- `src/data/` — test data (credentials via `.env` or local JSON)
- `global-setup/` — role-based authentication

## Reports

```bash
npm run test:report
```
