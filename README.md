# Connectors-Automation-Playwright

End-to-end Playwright automation for Simpplr Enterprise Search Connectors.

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
npm run test:connectors:confluence:all
npm run test:app-manager
```

## Structure

```
src/
  core/                          # Shared config, helpers, base pages
  modules/
    es-connectors/
      config/                    # Module configuration
      constants/                 # UI labels, messages, tags
      fixtures/                  # Playwright fixtures
      helpers/                   # Module-specific helpers
      test-data/                 # Connector test data (.env + JSON)
      tests/
        ui-tests/                # E2E UI specs (confluence, box, dropbox, smoke)
        regression/              # Regression specs
      ui/
        pages/                   # Page objects
        components/              # Reusable form components
      playwright.es-connectors.config.ts
global-setup/                    # Role-based authentication
```

## Reports

```bash
npm run test:report
```
