# Inventory Design

## Scope

StockPilot tracks whole units of products.
Creating a product does not create stock.
A product without movements has zero stock.

## Stock movements

Each movement belongs to one product and contains:

- A generated ID.
- A type: in or out.
- A positive integer quantity.
- An immutable timestamp assigned by the server.

The quantity is always positive.
The movement type determines whether stock increases or decreases.

## Stock calculation

Current stock equals total stock-in quantities minus
total stock-out quantities.

Initially, the balance is calculated from movement history.
Product does not store a separate stock quantity.

## Rules

- Only active products can receive new movements.
- Stock-out cannot exceed available stock.
- Rejected operations do not create movement records.
- Recorded movements cannot be edited or deleted through the application.
- Corrections use a new movement.
- Products with movement history must retain that history.
- Existing history remains visible when a product is deactivated.

## Concurrency

Stock-out validation and persistence must happen in one transaction.
Operations for the same product must be serialized using a database
locking strategy so concurrent requests cannot produce negative stock.

## Implementation order

1. Stock-in domain behavior and unit tests.
2. Doctrine mapping and migration.
3. Stock-in API endpoint.
4. Stock-in frontend form.
5. Stock-out behavior with transaction and locking protection.
6. Movement history and current-stock display.

## Deferred work

- Fractional quantities and units of measurement.
- Locations and warehouses.
- Purchase costs and inventory valuation.
- Recording the authenticated user responsible for each movement.

## Low-stock thresholds

- Each product has a threshold, initially zero.
- Thresholds are integers between 0 and 2147483647.
- An active product is low stock when its balance is at or below
  its threshold.
- Products without movements have a balance of zero.
- Inactive products are excluded from low-stock reporting.
- Thresholds are warnings; they do not restrict valid stock operations.
- Changing a threshold does not change stock or movement history.