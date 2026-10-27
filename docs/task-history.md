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

## Task 16 — Update Products with PUT

### Completed

- Added Product::updateDetails() and a unit test.
- Renamed CreateProductInput to ProductDetailsInput.
- Shared JSON parsing and validation between POST and PUT.
- Added PUT /api/products/{id}, requiring name and SKU.
- Used Doctrine change tracking and flush for managed entities.

### Verification

Executed by the learner; outputs reviewed in chat:

- Syntax, container lint, and PUT route matching passed.
- Update returned 200 with normalized details and unchanged ID.
- GET confirmed persistence.
- Repeating the same PUT returned 200.
- Duplicate SKU returned 409.
- Blank values returned 422.
- Missing product returned 404.
- Full backend suite passed: 7 tests, 20 assertions.
- Mapping is valid and database schema remains synchronized.
- Assistant inspected the implementation.

### Decisions and limitations

- PUT requires all currently editable fields; PATCH is not implemented.
- Missing-record lookup precedes request-body validation.
- Database integration tests remain deferred.
- Post-conflict database state was not independently verified.
- Existing Content-Type, unknown-field, and authentication limitations remain.

## Task 17 — Product Activation & Deactivation

### Completed

- Added active status, defaulting to true for new PHP entities.
- Added activate/deactivate methods and unit tests.
- Migrated existing products to active before enforcing NOT NULL.
- Included active in list, detail, creation, and update responses.
- Added POST activation and deactivation endpoints.

### Verification

Executed by the learner; outputs reviewed in chat:

- Entity tests cover initial status and repeated state transitions.
- Migration preview reviewed and migration applied successfully.
- Existing product records preserved and backfilled as active.
- List and detail responses include boolean active status.
- Deactivation persisted; detail updates preserved inactive status.
- Reactivation returned active status.
- Missing product returned 404.
- Full backend suite passed: 9 tests, 25 assertions.
- Mapping is valid and database schema remains synchronized.
- Assistant inspected entity, migration, and controller changes.

### Decisions and limitations

- Deactivation preserves records; it does not delete products.
- List endpoint still includes inactive products.
- Database-backed endpoint verification remains manual.
- Database integration tests remain deferred.
- Reversing the migration removes stored activation choices.
- Previously recorded dependency and API limitations remain open.

## Task 18 — Product Search & Status Filtering

### Completed

- Added ProductRepository and associated it with Product.
- Injected the repository into ProductController.
- Added case-insensitive substring search across name and SKU.
- Added optional active=true/false filtering.
- Combined filters using bound query parameters and grouped conditions.
- Rejected invalid query parameter types and status values with JSON 400.

### Verification

Executed by the learner; outputs reviewed in chat:

- Syntax and container checks passed.
- Name and SKU searches returned expected products.
- Unmatched search returned an empty data array.
- Combined search/status filters returned expected results.
- Unfiltered listing included inactive products.
- Surrounding search whitespace was ignored.
- Array parameters and invalid status values returned 400.
- Sample product reactivated after verification.
- Existing backend suite passed: 9 tests, 25 assertions.
- Mapping is valid and database schema remains synchronized.
- Assistant inspected repository and controller changes.

### Decisions and limitations

- Omitted status includes both active and inactive products.
- Search treats percent and underscore as literal characters.
- Listing remains unpaginated.
- Repository query verification remains manual.
- Database integration tests and earlier limitations remain deferred.

## Task 19 — Product List Pagination

### Completed

- Added database offset and limit to product listing.
- Validated page and limit query parameters.
- Defaulted to page 1 and limit 20; capped limit at 100.
- Guarded against integer overflow in offset calculation.
- Added filtered totals and pagination metadata.
- Documented the repository's structured return type with PHPDoc.

### Verification

Executed by the learner; outputs reviewed in chat:

- Syntax and container checks passed.
- Pages 1 and 2 with limit 1 returned distinct products.
- Out-of-range page returned empty data with preserved totals.
- Search results produced matching filtered totals.
- Unmatched search returned total 0 and totalPages 0.
- Invalid ranges, decimal pages, and array pages returned JSON 400.
- Existing backend suite passed: 9 tests, 25 assertions.
- Mapping is valid and database schema remains synchronized.

### Decisions and limitations

- Results remain ordered by ascending ID.
- Count and page retrieval use separate queries.
- Concurrent changes may affect consistency between queries or pages.
- Large offsets can become expensive.
- Pagination verification remains manual; database tests are deferred.
- Earlier API and dependency limitations remain open.

## Task 20 — Fetch Real Products from Symfony

### Completed

- Configured the backend address in ignored frontend/.env.local.
- Replaced sample names with a server-side Symfony API fetch.
- Displayed product names, SKUs, active status, and result totals.
- Added loading and error fallbacks with retry.
- Added runtime response parsing and six parser tests.

### Verification

Executed by the learner; outputs reviewed in chat unless noted:

- Backend returned product data and pagination metadata.
- Frontend environment file is ignored by Git.
- Learner confirmed real products displayed and error recovery worked.
- Parser tests passed: 6 tests.
- Full frontend suite passed: 9 tests across 3 files.
- ESLint and TypeScript checks passed.
- Production build passed; /products is dynamic.
- Assistant inspected page, types, parser, and fallback components.

### Decisions and limitations

- Next.js fetches Symfony from a Server Component.
- Backend address is not exposed through NEXT_PUBLIC_.
- Fetch uses no-store; browser CORS configuration is unnecessary here.
- Page displays only the first API page; no pagination controls yet.
- Sample ProductSearch remains available but is not used on this page.
- Parser checks structure and ranges, not all metadata relationships.
- Network integration and error recovery were verified manually.
- Earlier API and dependency limitations remain open.

## Task 21 — URL-Based Product Filters

### Completed

- Read and validated searchParams in the Products Server Component.
- Forwarded search and status filters to Symfony.
- Added a native GET form and Clear filters link.
- Initialized form fields from the URL.
- Keyed the form by applied filters to reset uncontrolled fields on navigation.
- Extracted filter parsing and added eight unit tests.

### Verification

- Learner confirmed search, status, combined filters, and refresh behavior.
- Learner confirmed clearing resets results and both form fields.
- Filter-parser tests passed: 8 tests; output reviewed in chat.
- Learner reported no errors for the final suite, lint, type check, and build.
- Final command outputs were not shared.
- Assistant inspected the page, parser, and form key.

### Decisions and limitations

- URL is the source of truth for applied filters.
- Filtering runs in Symfony before pagination.
- Empty frontend status means all statuses and is omitted from the API request.
- Repeated filter parameters receive a visible validation message.
- Native form submission performs document navigation.
- Form navigation and API integration remain manually verified.
- Pagination controls are not implemented yet.
- Earlier API and dependency limitations remain open.

## Task 22 — Frontend Pagination

### Completed

- Validated page and limit URL parameters with safe-integer checks.
- Forwarded pagination to Symfony.
- Displayed requested page and total-page metadata.
- Added Previous/Next links preserving search, status, and limit.
- Preserved limit while resetting page when submitting filters.
- Added pagination parser cases and URL-builder tests.

### Verification

- Filter-parser tests passed: 20 tests; output reviewed.
- URL-builder tests passed: 3 tests; output reviewed.
- Learner confirmed page navigation and filter preservation.
- Learner confirmed out-of-range recovery and empty-result behavior.
- Learner reported no errors for the final suite, lint, type check,
  and production build. Final outputs were not shared.
- Assistant inspected pagination forwarding and navigation code.

### Decisions and limitations

- Pagination remains URL-driven without additional client state.
- Previous on an out-of-range page links to the last available page.
- Clear filters restores default filters and pagination.
- URL-builder tests do not execute network requests.
- Navigation behavior remains manually verified.
- Earlier API and dependency limitations remain open.

## Task 23 — Product Details & Dynamic Routes

### Completed

- Created /products/[id] using asynchronous route params.
- Validated ID syntax before fetching.
- Fetched individual products from Symfony.
- Extracted shared Product response validation.
- Added a detail-response parser and ten tests.
- Added tailored missing-product UI and listing links.

### Verification

Executed by the learner; outputs reviewed unless noted:

- Learner confirmed existing products display their details.
- Learner confirmed invalid and missing IDs show not-found UI.
- Learner confirmed backend failure reaches the error fallback.
- Full frontend suite passed: 42 tests across 6 files.
- ESLint and TypeScript checks passed.
- Production build passed with dynamic list and detail routes.

### Decisions and limitations

- API 404 selects notFound; other failures remain errors.
- Successful API responses are validated at runtime.
- Back to products returns to the unfiltered listing.
- Detail fetching and navigation remain manually verified.
- Streaming may retain HTTP 200 while displaying not-found UI.
- Earlier API and dependency limitations remain open.

## Task 24 — Frontend Product Creation

### Completed

- Added /products/new and a creation link from the listing.
- Created an interactive form using useActionState.
- Submitted JSON to Symfony through a Server Action.
- Displayed field errors and preserved input after failures.
- Redirected successful creation to the validated product detail URL.
- Added form-data and validation-error mapping helpers with tests.

### Verification

- Form-data tests passed: 4 tests; output reviewed.
- Error-mapping tests passed: 4 tests; output reviewed.
- Learner confirmed creation and detail-page redirect.
- Learner confirmed duplicate-SKU and whitespace-only feedback.
- Learner confirmed backend-failure handling and preserved inputs.
- Learner reported no errors for the final suite, lint, type check,
  and production build. Final outputs were not shared.
- Assistant inspected the form, action, page, and helper implementations.

### Decisions and limitations

- Symfony remains authoritative for validation and persistence.
- Browser constraints and basic form-data checks provide early feedback.
- Pending submission disables ordinary form interaction.
- POST requests are not automatically retried.
- Network failure can leave creation outcome uncertain.
- Full submission flow remains manually verified.
- Authentication and authorization remain deferred.
- Earlier API and dependency limitations remain open.

## Task 25 — Frontend Product Editing

### Completed

- Added /products/[id]/edit with existing product data.
- Extracted shared server-side product fetching.
- Refactored creation and editing to use ProductForm.
- Bound the product ID to an update Server Action.
- Submitted PUT requests with shared validation-error handling.
- Added an Edit link and two reusable-form tests.

### Verification

- Learner confirmed prefilled fields and successful update redirects.
- Learner confirmed duplicate-SKU feedback and preserved input.
- Learner confirmed rejected updates did not change the stored SKU.
- Learner confirmed required-value and backend-failure handling.
- Learner confirmed editing preserved inactive status and restored it afterward.
- Form tests passed: 2 tests; output reviewed.
- Learner reported no errors for the final suite, lint, type check,
  and production build. Final outputs were not shared.
- Assistant inspected the shared fetch, form, action, and page wiring.

### Decisions and limitations

- Product ID is bound to the action and validated again server-side.
- Editing submits name and SKU only; activation remains separate.
- Form state is initialized from props and keyed by product ID.
- Server helper filename communicates intent but does not enforce isolation.
- Full update flow remains manually verified.
- Authentication and authorization remain deferred.
- Earlier API and dependency limitations remain open.

## Task 26 — Frontend Activation Controls

### Completed

- Added a Server Action requesting an explicit activation state.
- Validated the returned product ID and status.
- Added detail-page activation controls with pending and error feedback.
- Refreshed detail and listing paths after successful changes.
- Added four component tests.

### Verification

- Learner confirmed activation and deactivation update the displayed status.
- Learner confirmed persistence after refresh and inactive-list filtering.
- Learner confirmed backend-failure feedback without optimistic status changes.
- Component tests passed: 4 tests; output reviewed.
- Learner reported no errors for the final suite, lint, type check,
  and production build. Final outputs were not shared.
- Assistant inspected the action, component, and page wiring.

### Decisions and limitations

- Actions request a specific state rather than toggling database state blindly.
- Status display comes from refreshed server data.
- Failed requests require checking the product before retrying.
- Component tests mock the action; full integration remains manually verified.
- Authentication and authorization remain deferred.
- Earlier API and dependency limitations remain open.

## Task 27 — Testing the Activation Server Action

### Completed

- Added 15 isolated tests for the activation Server Action.
- Mocked fetch and Next.js path revalidation.
- Covered activation, deactivation, HTTP and network failures.
- Covered malformed JSON, invalid data, and mismatched product ID or status.
- Verified invalid input and missing configuration prevent API requests.
- Restored mocked globals and environment variables after each test.

### Verification

Executed by the learner; outputs reviewed:

- Frontend suite: 71 tests passed across 11 files.
- ESLint and TypeScript checks passed.
- Production build passed.

### Decisions and limitations

- Tests use the real product response parser.
- API requests and path revalidation are mocked.
- Live integration remains covered by earlier manual checks.
- Database integration tests and authentication remain deferred.

## Task 28 — Testing Product Creation Submission

### Completed

- Added nine isolated tests for the product creation Server Action.
- Verified invalid fields prevent API requests.
- Covered duplicate SKUs and API validation errors.
- Verified the POST request and successful redirect.
- Covered unexpected HTTP responses, malformed JSON, invalid product
  data, network failures, and missing configuration.
- Verified submitted values are preserved after errors.

### Verification

- Learner reported all final checks passed:
  - 80 tests across 12 files.
  - ESLint.
  - TypeScript.
  - Production build.
- Outputs for the first four creation-action tests were reviewed.
- Final check outputs were not shared.

### Decisions and limitations

- Fetch and redirect are mocked; validation helpers remain real.
- The success test verifies that the redirect signal escapes the action.
- These tests do not contact Symfony or write to PostgreSQL.
- Database integration tests and authentication remain deferred.

## Task 29 — Testing Product Updates

### Completed

- Added 15 isolated tests for the product update Server Action.
- Verified the PUT request and successful redirect.
- Covered missing products, duplicate SKUs, and validation errors.
- Rejected responses containing a different product ID.
- Covered HTTP failures, malformed JSON, invalid product data,
  and network failures.
- Verified invalid IDs and missing configuration prevent API requests.
- Verified submitted edits are preserved after errors.

### Verification

- Outputs for the first six update-action tests were reviewed.
- Learner reported all final checks passed:
  - 95 tests across 13 files.
  - ESLint.
  - TypeScript.
  - Production build.
- Final check outputs were not shared.

### Decisions and limitations

- Fetch and redirect are mocked; validation helpers remain real.
- Tests do not contact Symfony or write to PostgreSQL.
- Database integration tests and authentication remain deferred.

## Task 30 — Inventory Domain Design

### Completed

- Defined stock movements and whole-unit quantities.
- Chose movement history as the source of current stock.
- Documented rules for inactive products and insufficient stock.
- Required preservation of movement history.
- Identified transaction and locking requirements.
- Recorded implementation order and deferred features.

### Verification

- Assistant reviewed docs/inventory-design.md.
- Documentation only; no application code or database changes.
- No automated tests required for this documentation change.

## Task 31 — Stock-In Domain Behavior and Unit Tests

### Completed

- Added a string-backed enum for movement direction.
- Added StockMovement with a named stockIn factory.
- Required positive quantities and active products.
- Assigned an immutable timestamp in UTC.
- Added four unit tests for valid and rejected movements.

### Verification

- Enum syntax and Composer autoloading verified.
- StockMovement syntax check passed.
- Movement tests passed: 4 tests, 11 assertions.
- Full backend suite passed: 13 tests, 36 assertions.
- Assistant reviewed the implementation and tests.

### Decisions and limitations

- Movement objects expose no setters.
- Movements are not yet mapped or saved through Doctrine.
- No stock-in endpoint or frontend form exists yet.
- Stock-out behavior and concurrency protection remain deferred.

## Task 32 — Stock Movement Mapping and Migration

### Completed

- Mapped StockMovement with Doctrine attributes.
- Added a required ManyToOne relationship to Product.
- Stored movement direction using a string-backed enum.
- Added a migration for the stock_movements table.
- Restricted deletion of products referenced by movements.
- Added database checks for positive quantities and allowed types.

### Verification

- Doctrine recognized Product and StockMovement.
- Migration syntax check passed.
- Migration dry-run SQL was reviewed.
- Learner reported successful migration and database checks.
- Full backend suite passed: 13 tests, 36 assertions.
- Final migration and constraint-query outputs were not shared.

### Decisions and limitations

- Timestamps are assigned in UTC by the application.
- Custom check constraints are defined in the migration.
- Unit tests do not verify database persistence.
- No stock-in endpoint or frontend form exists yet.
- Stock-out concurrency protection remains deferred.

## Task 33 — Stock-In API Endpoint

### Completed

- Added POST /api/products/{id}/stock-in.
- Required an integer quantity between 1 and 2147483647.
- Validated input through StockInInput.
- Created and persisted movements using the stockIn factory.
- Returned 201 with the saved movement.
- Returned JSON errors for invalid requests and inactive products.

### Verification

Executed by the learner; outputs reviewed:

- DTO tests passed: 5 tests, 10 assertions.
- Full backend suite passed: 18 tests, 46 assertions.
- Controller syntax, route, and container checks passed.
- Doctrine mapping and database schema validation passed.
- A stock-in request saved 10 units for product 2.
- Invalid requests returned 400, 422, or 409 as expected.
- Rejected requests left one movement totaling 10 units.
- Product 2 was reactivated after verification.
- Assistant reviewed the controller, DTO, and tests.

### Decisions and limitations

- API persistence was verified manually.
- Automated database integration tests remain deferred.
- Active status is checked on the loaded product.
- Concurrent activation changes are not yet coordinated with movements.
- Authentication, stock-out, and the frontend form remain deferred.

## Task 34 — Stock-In Form in Next.js

### Completed

- Added the stock-in page and product-detail navigation link.
- Hid the form for inactive products.
- Added quantity parsing and runtime API-response validation.
- Submitted numeric quantities through a Server Action.
- Checked that returned product ID and quantity match the request.
- Added pending, error, and success feedback.
- Added 16 input tests, 16 response-parser tests, and two form tests.

### Verification

- Learner confirmed the browser submission and confirmation worked.
- Response-parser tests passed: 16 tests; output reviewed.
- Form tests passed: two tests; output reviewed.
- Learner reported the remaining requested checks passed.
- Expected full-suite count: 129 tests across 16 files.
- Final suite and build outputs were not shared.
- Assistant reviewed the page, action, form, and validation helpers.

### Decisions and limitations

- Form values remain strings until validated and converted.
- Symfony remains responsible for business rules and persistence.
- Pending feedback prevents repeated clicks, not duplicate requests.
- The success query parameter is a display hint.
- Movement history UI and request deduplication remain deferred.
- The Server Action is not yet covered by isolated action tests.

## Task 35 — Movement History and Current Stock

### Completed

- Added a StockMovement repository.
- Calculated current stock from all movement quantities and directions.
- Added read-only stock and recent-movement endpoints.
- Limited recent history to 20 entries, ordered by timestamp and ID.
- Displayed current stock and movement history on the product page.
- Added response validation, parser tests, and history-display tests.

### Verification

- Stock API and direct SQL both returned 15 units for product 2.
- Learner confirmed history and stock display worked.
- Stock-response tests passed: 11 tests; output reviewed.
- History-response tests passed: 16 tests; output reviewed.
- History-display tests passed: two tests; output reviewed.
- Learner reported remaining requested checks passed.
- Expected frontend total: 158 tests across 19 files.
- Expected backend total: 18 tests, 46 assertions.
- Final suite, build, and schema-check outputs were not shared.
- Assistant reviewed the repository, endpoints, and frontend wiring.

### Decisions and limitations

- Current stock includes all movements, regardless of the history limit.
- Inactive products retain readable stock and history.
- Dates are displayed in UTC.
- Balance and history use separate reads and can briefly differ
  during concurrent changes.
- Full history pagination and automated database tests remain deferred.
- Stock-out operations and concurrency protection remain deferred.

## Task 36 — Stock-Out Rules and Unit Tests

### Completed

- Added a stockOut factory accepting the available balance.
- Allowed issuing exactly the available stock.
- Rejected insufficient stock and zero available stock.
- Rejected nonpositive quantities, inactive products,
  and negative supplied balances.
- Added eight stock-out unit tests.

### Verification

Executed by the learner; outputs reviewed:

- Movement tests passed: 12 tests, 29 assertions.
- Full backend suite passed: 26 tests, 64 assertions.
- Assistant reviewed the factory and tests.

### Decisions and limitations

- Movement quantities remain positive; direction determines their effect.
- Available stock is supplied by the caller.
- No stock-out movement was persisted during these tests.
- The factory alone does not provide concurrency protection.
- Transactional balance retrieval, locking, and the endpoint come next.

## Task 37 — Transactional Stock-Out API and Locking

### Completed

- Added POST /api/products/{id}/stock-out.
- Renamed StockInInput to StockQuantityInput for both directions.
- Extracted shared request parsing and validation.
- Added a service coordinating movement transactions and persistence.
- Locked and refreshed the product before checking its state.
- Calculated available stock after acquiring the product lock.
- Applied the same locking protocol to stock-in and activation changes.

### Verification

Outputs reviewed:

- Backend suite passed: 26 tests, 64 assertions.
- A stock-out of four units was saved successfully.
- Insufficient stock returned 409 without adding a movement.
- PostgreSQL reported read committed isolation.
- A waiting API transaction was observed through pg_stat_activity.
- After lock release, the request completed with 409.
- A controlled SQL transaction committed an eight-unit stock-out.
- The subsequent API result rejected four units against a balance of three.
- Database checks confirmed three units and four movements at that point.

Learner reported the remaining regression, suite, and schema checks passed;
their final outputs were not shared.

### Decisions and limitations

- Transactions commit and flush through Doctrine wrapInTransaction.
- Domain failures roll back before the controller returns 409.
- Quantity validation runs before product lookup for both movement endpoints.
- Locking depends on all application writers following the same protocol.
- Contention was manually tested against a SQL-held lock.
- Two simultaneous HTTP stock-out requests were not directly tested.
- Automated database concurrency tests remain deferred.
- No stock-out frontend exists yet.
- Request deduplication and explicit lock-timeout handling remain deferred.

## Task 38 — Stock-Out Form in Next.js

### Completed

- Added the stock-out page and product-detail navigation link.
- Shared quantity parsing, form state, and the movement form.
- Extracted a reusable movement type guard.
- Added stock-out response validation and 15 parser tests.
- Handled insufficient stock, inactive products, and uncertain results.
- Added stock-out form coverage and success feedback.
- Refreshed stock and history after confirmed submission.

### Verification

- Stock-out parser tests passed: 15 tests; output reviewed.
- Shared form tests passed: three tests; output reviewed.
- Quantity-parser and existing stock-in tests remained passing.
- Insufficient-stock submission left four units and five movements.
- Learner confirmed successful issue and refreshed stock/history.
- Learner reported final requested checks passed.
- Expected frontend total: 174 tests across 20 files.
- Final suite and build outputs were not shared.
- Assistant reviewed the action, page, shared form, and renames.

### Decisions and limitations

- Displayed availability is informational; Symfony checks the balance.
- The action never submits an authoritative available balance.
- Known conflict responses are matched by backend message text.
- Structured error codes remain deferred.
- The success query parameter is a display hint.
- Inventory Server Action tests and request deduplication remain deferred.

## Task 39 — Testing Inventory Server Actions

### Completed

- Added 20 stock-out and 18 stock-in action tests.
- Verified numeric request quantities, response matching,
  page revalidation, and redirects.
- Covered conflicts, validation errors, and missing products.
- Verified invalid input and missing configuration prevent requests.
- Verified uncertain results preserve input without automatic retries.

### Verification

- Learner executed the full suite: 212 tests across 22 files passed.
- Assistant executed both inventory-action test files:
  38 tests passed.
- Assistant executed ESLint and TypeScript checks: passed.
- Learner reported the production build passed.
- Assistant created the stock-in action test at the learner's request.

### Decisions and limitations

- Fetch, redirects, and path revalidation are mocked.
- Quantity readers and response parsers remain real.
- Tests do not modify database records.
- Database concurrency remains manually verified.
- Kept test isolation despite the optional jsdom performance suggestion.

## Task 40 — Dashboard with Real Data

### Completed

- Added GET /api/dashboard.
- Calculated total, active, and inactive product counts.
- Calculated total units across all products.
- Loaded the five latest movements with their products in one query.
- Replaced sample overview values with validated API data.
- Added product links, UTC timestamps, and movement directions.
- Added loading and recoverable error feedback.
- Added 12 parser tests and two display tests.

### Verification

- Product counts matched direct SQL: three total, three active,
  zero inactive.
- Total stock matched direct SQL: three units.
- Dashboard API response was reviewed.
- Learner confirmed summary cards, movement links, and error recovery.
- Parser tests passed: 12 tests; output reviewed.
- Display tests passed: two tests; output reviewed.
- Learner reported remaining final checks passed.
- Expected frontend total: 226 tests across 24 files.
- Expected backend total: 26 tests, 64 assertions.
- Final suite, build, and schema-check outputs were not shared.
- Assistant reviewed the implementation.

### Decisions and limitations

- Stock totals include inactive products.
- Dashboard sections use separate queries, not one consistent snapshot.
- Product names and SKUs reflect current product details.
- Low-stock reporting awaits a threshold rule.
- Inventory valuation awaits pricing.
- Dashboard database queries remain manually verified.
- The unused sample low-stock component remains as a learning example.

## Task 41 — Low-Stock Thresholds

### Completed

- Added a product threshold with default zero and domain validation.
- Added a migration initializing existing products and preventing
  negative thresholds.
- Added a validated threshold-update API endpoint.
- Counted active products at or below their threshold using DBAL.
- Connected the dashboard widget to the real count.
- Extended dashboard-response validation and tests.

### Verification

Outputs reviewed:

- Product tests passed: 10 tests, 19 assertions.
- Backend suite before DTO additions passed: 32 tests, 72 assertions.
- Threshold DTO tests passed: three tests, seven assertions.
- Migration dry-run SQL was reviewed.
- Valid threshold updates returned 200; invalid values returned 422.
- Rejected updates preserved the stored threshold.
- Dashboard parser tests passed: 15 tests.
- Low-stock widget tests passed: three tests.
- Final API response showed three active and three low-stock products.

Learner reported remaining requested checks passed.
Expected final totals: 35 backend tests with 79 assertions,
and 231 frontend tests across 24 files.
Final suite, build, and schema-check outputs were not shared.

### Decisions and limitations

- Equality counts as low stock; zero-stock products are included.
- Inactive products are excluded.
- Threshold configuration currently uses the API.
- Dashboard queries use separate database snapshots.
- Database query and endpoint behavior remain manually verified.
- Assistant reviewed the final implementation.

## Task 42 — Edit Low-Stock Thresholds in Next.js

### Completed

- Added a GET endpoint for the saved threshold.
- Added response validation and form-data parsing.
- Added a prefilled threshold settings page and product-page link.
- Saved numeric thresholds through a Server Action.
- Refreshed the product page and dashboard after success.
- Added 14 response-parser tests, 16 input-parser tests,
  and four form tests.

### Verification

- GET endpoint returned the saved threshold of five.
- Learner confirmed saving, dashboard-count changes,
  zero handling, and restoring the threshold to five.
- Response-parser tests passed: 14 tests; output reviewed.
- Input-parser tests passed: 16 tests; output reviewed.
- Form tests passed: four tests; output reviewed.
- Learner reported remaining final checks passed.
- Expected frontend total: 265 tests across 27 files.
- Expected backend total: 35 tests, 79 assertions.
- Final suite, build, and schema-check outputs were not shared.
- Assistant reviewed the implementation.

### Decisions and limitations

- Zero is a valid threshold; null represents a missing product.
- Thresholds remain configurable for inactive products.
- Setting changes do not create stock movements.
- The success query parameter is a display hint.
- The threshold Server Action is not yet covered by isolated tests.
- Authentication and authorization remain deferred.

## Task 43 — Authentication Design

### Completed

- Chose Symfony-managed sessions with Next.js handling browser requests.
- Defined explicit forwarding of the current user's session.
- Documented cookie handling, session rotation, expiry, and logout.
- Defined protected endpoints and 401/403 behavior.
- Required CSRF protection for login, logout, and mutations.
- Deferred registration, password recovery, and additional roles.

### Verification

- Assistant reviewed the authentication design document.
- Documentation only; no dependencies or application behavior changed.
- No automated tests required for this documentation change.

### Decisions and limitations

- Initial authenticated users can manage inventory.
- Initial accounts will be provisioned through a console command.
- Authentication and authorization are designed but not implemented.

## Task 44 — Symfony Security and the User Entity

### Completed

- Installed Symfony SecurityBundle 7.4.21 and its dependencies.
- Added User with normalized email identifiers and ROLE_USER.
- Added password-hash storage and domain validation.
- Created and applied the users migration with a unique email index.
- Configured a Doctrine-backed user provider.
- Added a repository supporting password-hash upgrades.
- Added six user-model tests and a configured-hasher integration test.
- Exposed the hasher through a test-only public alias.

### Verification

Outputs reviewed:

- User-model tests passed: six tests, 10 assertions.
- Configured-hasher test passed: one test, three assertions.
- Migration dry-run and successful execution were reviewed.
- Schema validation passed.
- Required user columns and unique email index were verified.

Learner reported the remaining final checks passed.
Expected backend total: 42 tests, 92 assertions.
Final full-suite and Composer-check outputs were not shared.
Assistant reviewed configuration, entity, repository, and tests.

### Decisions and limitations

- All initial users receive ROLE_USER.
- New users must receive a password hash before persistence.
- Email identifiers are trimmed and lowercased.
- Test hashing costs are lower than production costs.
- No account has been provisioned by this task.
- Login and access restrictions are not implemented.
- Safe user serialization must be addressed before session login.

## Task 45 — Provision a User Through Symfony Console

### Completed

- Added app:create-user with an email argument.
- Required interactive, hidden password entry and confirmation.
- Preserved password whitespace and disabled visible-input fallback.
- Applied a 12–128 character provisioning policy.
- Used Symfony's configured password hasher before persistence.
- Rejected duplicate emails without overwriting accounts.
- Added two command tests for early input guards.

### Verification

Outputs reviewed:

- Command registration and container validation passed.
- Database query confirmed one user with a nonempty hash field.
- Duplicate email returned exit code 1.
- Invalid email and noninteractive execution returned exit code 2.
- User count remained one after rejected commands.
- Command tests passed: two tests, four assertions.

Learner reported remaining final checks passed.
Expected backend total: 44 tests, 96 assertions.
Final full-suite and schema-check outputs were not shared.
Assistant reviewed the command and tests.

### Decisions and limitations

- Passwords are entered through prompts, never command arguments.
- Account data remains in the local database, not Git.
- Automated command tests exit before database access.
- Successful provisioning and duplicate detection were manually verified.
- Login, safe session serialization, and access restrictions remain pending.

## Task 46 — Safe User Session Serialization

### Completed

- Added User::__serialize().
- Replaced the serialized password hash with Symfony's supported
  CRC32C fingerprint.
- Preserved null for users without an assigned password.
- Added three serialization tests.

### Verification

Executed by the learner; outputs reviewed:

- User syntax check passed.
- Serialization tests passed: three tests, 10 assertions.
- Full backend suite passed: 47 tests, 106 assertions.
- Tests verified the original object's hash remains unchanged.
- Tests verified restored identity, roles, and null-password handling.
- Assistant reviewed the implementation and tests.

### Decisions and limitations

- CRC32C is used only for session comparison, never password storage.
- The database continues storing the full password hash.
- No schema changes or account changes were required.
- Actual session persistence and password-change invalidation
  remain to be tested during login implementation.