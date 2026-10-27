# Authentication Design

## Initial scope

- Users sign in using email and password.
- Symfony owns user records, password verification, and sessions.
- Next.js provides the login form and browser-facing session handling.
- Initial accounts are provisioned through a console command.
- Public registration and password recovery are deferred.

## Request flow

Browser -> Next.js -> Symfony -> PostgreSQL

Next.js forwards the current user's session identifier explicitly
to the configured Symfony API.

Session credentials must never be stored in a shared global variable
or forwarded to arbitrary URLs.

## Session cookie

- Contains an opaque session identifier, not a password.
- HttpOnly prevents browser JavaScript from reading it.
- SameSite=Lax provides an additional cross-site restriction.
- Secure is required with HTTPS in production.
- Cookie lifetime and backend expiry must be coordinated.
- Login must handle session ID rotation.
- Logout must invalidate the backend session and remove the browser cookie.

## Access rules

- Login and required authentication-bootstrap endpoints are public.
- The health endpoint remains public and exposes no private details.
- Product, inventory, threshold, and dashboard endpoints require login.
- Initial authenticated users can manage inventory.
- Additional role distinctions are deferred.
- Symfony enforces access independently of the frontend.
- Next.js also checks sessions before protected reads and actions.

## Error behavior

- Unauthenticated API requests return JSON with status 401.
- Authenticated but forbidden requests return JSON with status 403.
- The frontend redirects unauthenticated users to login.
- Invalid credentials produce a generic message.

## Request protection

- Login, logout, and cookie-authenticated mutations require CSRF protection.
- JSON request bodies alone do not provide CSRF protection.
- Passwords, cookies, and session identifiers must not be logged.
- Authenticated responses must not enter shared public caches.

## Deferred work

- Public registration and password recovery.
- Remember-me functionality.
- Additional roles and permissions.
- Mobile clients and third-party API access.