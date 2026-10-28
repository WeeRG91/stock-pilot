# Real-Time Inventory Design

## Initial scope

When a stock movement is recorded, other signed-in browsers refresh:

- The affected product's current stock.
- Its recent movement history.
- Dashboard stock totals, low-stock count, and recent activity.

Product catalog changes and threshold-change events are deferred.

## Architecture

Symfony -> Mercure hub -> subscribed browsers

- Symfony remains responsible for inventory rules and persistence.
- Mercure delivers notifications using Server-Sent Events.
- Next.js refreshes authenticated server data after receiving an event.
- The hub runs locally as a Windows executable; Docker is not required.

## Event payload

Notifications identify the changed product and recorded movement.
They do not replace the API as the source of inventory data.
Clients must tolerate duplicate notifications.

## Transaction boundary

- Publish only after the stock transaction commits successfully.
- Rejected or rolled-back operations must not publish an update.
- Notification failure must not make a committed movement appear rejected.
- Publication failures must be logged without exposing credentials.

## Authorization

- Inventory updates are private.
- Symfony verifies the existing session before granting subscription access.
- Subscriber credentials grant only the required topics.
- Publisher credentials remain server-side.
- Subscription expiry, renewal, and logout behavior must be implemented
  and tested explicitly.

## Reconnection

- Refresh current API data when a subscription connects or reconnects.
- Group rapid notifications to avoid excessive refresh requests.
- Close connections when their component unmounts.
- Never retry stock mutations automatically.

## Delivery limitations

Initial publication is best effort after commit.
A crash between commit and publication can lose a notification.
A transactional outbox and reliable retries are deferred.
Normal page loads and reconnection refreshes retrieve current data.

## Verification

- Record stock in one browser and observe another browser update.
- Verify private updates require subscription authorization.
- Verify rejected movements produce no notification.
- Verify hub downtime does not roll back committed inventory.
- Verify recovery, duplicate events, and logout behavior.

## Implemented stock notifications

- Topic: urn:stockpilot:inventory.
- Updates are private.
- Payload contains type inventory.changed, productId, and movementId.
- Event ID is urn:stockpilot:movement:{movementId}.
- Both stock-in and stock-out publish after wrapInTransaction returns.
- The recorder rejects an existing transaction to ensure it owns
  the actual commit boundary.
- Missing products and failed transactions do not publish.
- Publication is limited to two seconds, with redirects and retries disabled.
- Publication failures are contained and logged to var/log/inventory.log.
- The log directory must exist and be writable.

## Implemented subscription authorization

- POST /api/realtime/authorize requires ROLE_USER and an api CSRF token.
- Credentials grant subscribe-only access to urn:stockpilot:inventory.
- Tokens identify the authenticated user and expire after 60 seconds.
- The subscriber token is returned in an HttpOnly, SameSite=Strict cookie
  scoped to /.well-known/mercure, never in the JSON body.
- Local HTTP uses the prefix-less mercure_access_token cookie name.
- JSON contains only the hub URL, topic, and expiration.
- Next.js cookie forwarding, renewal, and connection cleanup remain pending.
- Logout does not immediately revoke an already issued subscriber token;
  its remaining validity is bounded by its expiration.