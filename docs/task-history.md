# StockPilot task history

## Task 01 — Development Environment & Symfony Initialization

Date: 2026-10-22

### Completed

- Verified PHP, required extensions, Composer, Git, and Symfony CLI.
- Created a minimal Symfony 7.4.21 LTS backend.
- Selected Herd PHP 8.3.22 through the root .php-version file.
- Inspected the generated application structure and console commands.
- Started the development server and viewed the Symfony welcome page.
- Initialized one Git repository at the StockPilot root on main.
- Verified ignore rules for dependencies, runtime files, and local overrides.
- Added Composer project metadata and synchronized the lock file.

### Verification

All checks below were executed by the learner and reviewed in chat:

- Symfony requirements checker: passed.
- Composer platform requirements: passed.
- Symfony console about and list: passed.
- Development server: running with PHP 8.3.22.
- Browser: Symfony welcome page displayed.
- Composer strict validation: passed.
- YAML lint: all 6 files passed.
- Service container lint: passed.
- No nested backend Git repository.

No automated application tests have been introduced or executed yet.

### Decisions and limitations

- Separate Symfony backend and future Next.js frontend.
- Minimal skeleton; dependencies will be introduced progressively.
- Shared .env files contain safe defaults; local overrides are ignored.
- Optional realpath_cache_size recommendation remains unchanged.
- No database, frontend, authentication, or business endpoints yet.

### Next steps

- Agree on Task 02 before starting further implementation.

## Task 02 — First JSON Endpoint

### Completed

- Created GET /api/health using a PHP route attribute.
- Returned application status through JsonResponse.
- Installed PHPUnit and Symfony browser testing tools.
- Added HealthControllerTest using WebTestCase.

### Verification

Executed by the learner and reviewed in chat:

- PHP syntax check: passed.
- Route registration: GET /api/health recognized.
- Manual HTTP request: 200, application/json, expected response body.
- Focused functional test: passed, 1 test and 4 assertions.
- Full test suite: passed, 1 test and 4 assertions.

### Decisions and limitations

- The controller uses a plain class without a base controller.
- The functional test uses Symfony's kernel without a running server.
- The endpoint confirms application responsiveness only.
- Database and external-service health are not checked.

## Task 03 — Services & Dependency Injection

### Completed

- Inspected service discovery, autowiring, and autoconfiguration.
- Injected LoggerInterface into HealthController through its constructor.
- Used the injected logger in the health action.
- Inspected the concrete logger service and container arguments.

### Verification

- PHP syntax and container lint passed before adding the logging call.
- Full functional suite passed after adding the call: 1 test, 4 assertions.
- Controller implementation reviewed directly by the assistant.
- Logging output and destination were not verified.

### Decisions

- Used Symfony's existing logger without additional dependencies.
- Constructor injection makes the controller's dependency explicit.
- The health-request log is a learning example; frequent polling could make it noisy in production.

## Task 04 — Configuration & Environment Variables

### Completed

- Defined APP_NAME=StockPilot as a shared environment default.
- Mapped APP_NAME to the app.name container parameter.
- Explicitly injected the application name into HealthController.
- Used an ignored .env.dev.local file to override the name in dev.

### Verification

Executed by the learner and reviewed in chat:

- YAML syntax and container lint passed.
- Controller arguments include the logger and APP_NAME.
- Dev console resolves APP_NAME to StockPilot Local.
- HTTP endpoint returns 200 with application: StockPilot Local.
- Git ignores .env.dev.local.
- Test suite passes with the shared default: 1 test, 4 assertions.

### Decisions and limitations

- Scalar constructor arguments are configured explicitly.
- Local development overrides are excluded from Git.
- The endpoint test verifies the default response.
- The development override was verified manually.

## Task 05 — Frontend Environment & Next.js Initialization

### Completed

- Verified Node.js 22.16.0 and npm 11.19.1.
- Used npm.cmd and npx.cmd without changing PowerShell execution policy.
- Created a separate Next.js 16.4.2 frontend with React 19.3.0.
- Enabled TypeScript, App Router, Tailwind CSS, and ESLint.
- Kept one Git repository at the StockPilot root.
- Deferred React Compiler and Cache Components.

### Verification

Executed by the learner and reviewed in chat:

- Direct dependencies installed successfully.
- No nested frontend Git repository.
- Development server started; starter page displayed in the browser.
- ESLint passed.
- Production build and TypeScript checks passed.
- node_modules and .next are ignored.
- Production dependency audit reported zero vulnerabilities.

### Known limitations

- Full audit reports five affected development packages from one
  underlying braces advisory, GHSA-vfj7-8cjw-p6xm.
- Installed ESLint 9 reports that it is unsupported.
- unrs-resolver has a pending install-script policy decision.
  Linting passed without approving it.
- No automated frontend tests yet.
- Frontend and backend are not connected.

## Task 06 — React Components, JSX & Props

### Completed

- Replaced the starter page with a StockPilot sample overview.
- Created SummaryCard with required, typed title and value props.
- Rendered cards from an array using map and stable keys.
- Added an optional description prop with conditional rendering.
- Kept the page and cards as Server Components.

### Verification

Executed by the learner and reviewed in chat:

- ESLint passed.
- TypeScript checks passed.
- Production build passed.
- Browser displays both cards with the expected sample values.
- Only the low-stock card displays a description.
- Component and page code inspected by the assistant.

### Limitations

- Values are static sample data.
- No backend integration or interactive state yet.
- No automated component tests have been introduced.

## Task 07 — State, Events & Client Components

### Completed

- Created LowStockSummary as a Client Component.
- Used useState and a click handler to toggle visibility.
- Kept the home page as a Server Component.
- Added accessible button labels and expanded-state attributes.
- Configured Vitest, jsdom, and React Testing Library.
- Added an automated hide-and-show interaction test.

### Verification

- Assistant reviewed the component, page, and test configuration.
- Learner confirmed browser toggle behavior.
- Focused interaction test passed: 1 test in 1 file.
  Output reviewed in chat.
- Learner reported the full suite, lint, TypeScript checks, and
  production build completed without errors.
  Final command outputs were not shared.

### Decisions and limitations

- State is local and resets on refresh.
- Component tests use jsdom, not a real browser.
- Used jsdom 27.4.0 for compatibility with Node 22.16.0.
- Updated Node type definitions to version 22.
- Previously documented development dependency warnings remain open.

## Task 08 — Controlled Inputs & Derived State

### Completed

- Created ProductSearch with a controlled search input.
- Derived filtered results from props and query state.
- Added case-insensitive matching and whitespace normalization.
- Displayed a result count and an empty-state message.
- Added tests for filtering, clearing, and unmatched searches.

### Verification

Executed by the learner; outputs reviewed in chat:

- Full frontend suite passed: 3 tests across 2 files.
- ESLint passed.
- TypeScript checks passed.
- Production build passed.
- Learner confirmed expected browser search behavior.
- Assistant reviewed the component and page implementation.

### Decisions and limitations

- Product names are static samples, independent of overview totals.
- Filtering runs during rendering without extra state or Effects.
- Tests use jsdom rather than a real browser.
- Singular result-count wording remains to be polished.
- Previously documented development dependency warnings remain open.

## Task 09 — Routing, Layouts & Navigation

### Completed

- Created /products using App Router filesystem routing.
- Moved sample product search from the overview to /products.
- Added shared navigation in the root layout using next/link.
- Updated the application title and description.

### Verification

Executed by the learner; outputs reviewed in chat:

- Existing component suite passed: 3 tests across 2 files.
- ESLint passed.
- TypeScript checks passed.
- Production build passed and includes / and /products.
- Learner confirmed navigation, direct access, and browser title.
- Assistant inspected both pages and the root layout.

### Decisions and limitations

- Pages and root layout remain Server Components.
- Interactive components retain their existing client boundaries.
- Navigation was checked manually; no automated navigation test yet.
- Products remain static samples without backend integration.
- Previously documented development dependency warnings remain open.

## Task 10 — PostgreSQL Environment & Doctrine Fundamentals

### Completed

- Verified the existing PostgreSQL 18.6 Windows service.
- Verified PHP's PostgreSQL PDO driver.
- Created the stockpilot login role and development database.
- Installed Doctrine ORM 3.7.5, DBAL 4.5.0, and migrations support.
- Configured credentials in ignored backend/.env.local.
- Used DATABASE_URL without the resolve processor.

### Verification

Executed by the learner; outputs reviewed in chat:

- PostgreSQL accepts connections on localhost:5432.
- stockpilot connects to the stockpilot database.
- Role has no superuser, database-creation, or role-management privileges.
- Symfony's Doctrine SQL query confirms the configured user and database.
- Git ignores .env.local.
- YAML lint, Composer validation, and platform requirements passed.
- Container lint passed.
- Backend test suite passed: 1 test, 4 assertions.
- Dev cache rebuilt and database connection rechecked successfully.

### Decisions and limitations

- Reused the existing Windows PostgreSQL installation.
- Application role owns its development database.
- No entities, application tables, or migrations created yet.
- No test database or automated database tests yet.
- Database credentials are excluded from Git.
- Local role and database creation are not reproduced by repository files.

## Task 11 — First Doctrine Entity & Migration

### Completed

- Wrote Product with mapped ID, name, and SKU properties.
- Used a database-generated ID and unique SKU index.
- Generated, reviewed, previewed, and applied the migration.
- Added a unit test for a new Product's initial state.

### Verification

Executed by the learner; outputs reviewed in chat:

- PHP syntax passed; Doctrine discovers Product.
- Migration applied: 1 executed, none pending.
- Mapping is valid and database schema is synchronized.
- Column inspection confirms non-nullable fields and identity ID.
- Product unit test passed: 1 test, 3 assertions.
- Full backend suite passed: 2 tests, 7 assertions.

### Decisions and limitations

- PHP ID is nullable before persistence; database primary key is not.
- Constructor requires name and SKU but does not reject empty strings.
- No persistence or duplicate-SKU integration tests yet.
- Migration down() drops the products table and its data.
- Verbose dry run reported deprecations in Doctrine's LazySchema integration; vendor files remain unchanged.

## Task 12 — Doctrine Persistence & Manual Verification

### Completed

- Created a Symfony command with an injected EntityManager.
- Used persist and flush to save a sample Product.
- Cleared managed entities and reloaded the Product by ID.
- Used a repository lookup to skip an existing sample SKU.

### Verification

Executed by the learner; outputs reviewed in chat:

- Command syntax, registration, and container lint passed.
- First execution saved and reloaded Product #1.
- Second execution skipped insertion.
- SQL confirmed the stored name and SKU.
- Existing backend suite passed: 2 tests, 7 assertions.
- Mapping is valid and database schema remains synchronized.
- Assistant inspected the final command.

### Decisions and limitations

- Database integration tests deferred at the learner's request.
- No test database or test credentials file created.
- Persistence verified manually against the development database.
- The preliminary SKU lookup does not prevent concurrent insert races.
- The database unique index remains the final uniqueness guarantee.
- Sample data is created by running the command, not by a migration.

## Task 13 — Product List REST Endpoint

### Completed

- Created GET /api/products.
- Retrieved products through Doctrine's standard repository.
- Ordered results by ascending ID.
- Returned explicit id, name, and sku fields inside a data wrapper.

### Verification

Executed by the learner; outputs reviewed in chat:

- PHP syntax, route registration, and container lint passed.
- HTTP request returned 200 and application/json.
- Response contained the persisted sample Product.
- Existing backend suite passed: 2 tests, 7 assertions.
- Database schema remains synchronized.
- Assistant inspected the controller implementation.

### Limitations

- Endpoint verification is manual; database integration tests remain deferred.
- Listing is unpaginated and has no search or filters.
- Empty-list behavior has not been exercised.
- Authentication and authorization have not been introduced.

## Task 14 — Product Details & Missing Records

### Completed

- Added GET /api/products/{id} with a digit-only route requirement.
- Retrieved a Product by primary key through the EntityManager.
- Returned explicit product fields for existing records.
- Returned a JSON error with HTTP 404 for missing records.

### Verification

Executed by the learner; outputs reviewed in chat:

- PHP syntax, route matching, and container lint passed.
- Existing product returned 200 and expected JSON.
- Missing product returned 404 and expected JSON error.
- Both responses use application/json.
- Existing backend suite passed: 2 tests, 7 assertions.
- Mapping is valid and database schema remains synchronized.
- Assistant inspected the controller implementation.

### Limitations

- Database-backed endpoint checks remain manual.
- Automated database tests remain deferred.
- Router-level errors do not yet share a standardized JSON format.
- Authentication and authorization have not been introduced.

## Task 15 — Create Products with Validated JSON

### Completed

- Installed Symfony Validator 7.4.21.
- Created CreateProductInput with trimming and validation constraints.
- Added four database-free DTO tests.
- Implemented POST /api/products with explicit response fields.
- Added 400 responses for malformed JSON or non-object bodies.
- Added 422 responses for invalid fields.
- Persisted valid products and returned 201 with a Location header.
- Returned 409 for duplicate SKU database violations.

### Verification

- Learner executed DTO tests: 4 tests, 10 assertions; output reviewed.
- Assistant inspected the DTO and creation action.
- Manual HTTP checks verified normalization, 400, and 422 responses.
- Creation returned 201; the Location URL returned the stored Product.
- Duplicate creation returned 409; SQL confirmed one matching row.
- Learner reported no errors for final Composer validation,
  full backend suite, and schema validation.
- Final check outputs were not shared.

### Decisions and limitations

- DTO validation is separate from entity persistence.
- Database uniqueness remains authoritative.
- Database integration tests remain deferred.
- Request Content-Type is not yet enforced.
- Unknown JSON fields are currently ignored.
- Authentication and authorization have not been introduced.