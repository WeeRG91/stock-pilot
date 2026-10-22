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