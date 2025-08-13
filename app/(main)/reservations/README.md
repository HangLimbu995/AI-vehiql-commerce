## Reservations Page — Complete Developer Guide

This folder implements the user reservations experience for test drives: a server-protected page, a server action to load a user’s bookings, and a client list UI that groups upcoming vs. past, with cancel flows and confirmations.

If you read only this file, you should be able to rebuild the entire feature from scratch with the same behavior and UX quality.

### File map

```
app/(main)/reservations/
  ├─ page.jsx                       Server component: auth + fetch bookings + render
  └─ _components/
      └─ reservations-list.jsx      Client component: grouping, actions, empty state
```

### Responsibilities (at a glance)

- `page.jsx`: server-only. Requires sign-in (Clerk), fetches bookings via `getUserTestDrives()`, renders the page shell and `ReservationsList`.
- `reservations-list.jsx`: client-only. Splits bookings into “upcoming” vs “past”, renders `TestDriveCard` rows, and wires cancel action with a confirmation dialog.

## Data model and contracts

### Source of truth
- Data is fetched by `actions/test-drive.js#getUserTestDrives()` using Prisma.
- Prisma models live in `prisma/schema.prisma` (notably `TestDriveBooking`, `Car`, `User`).

### What `getUserTestDrives` returns (shape simplified)

```ts
type GetUserTestDrivesResponse = {
  success: boolean;
  data?: Array<TestDriveBookingView>;
  error?: string;
}

type TestDriveBookingView = {
  id: string;
  carId: string;
  car: Car;                   // serialized
  bookingDate: string;        // ISO string
  startTime: string;          // "HH:mm" (24h)
  endTime: string;            // "HH:mm" (24h)
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes: string | null;
  createdAt: string;          // ISO
  updatedAt: string;          // ISO
}

type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  images: string[];
  status: "AVAILABLE" | "UNAVAILABLE" | "SOLD";
}
```

### Related actions
- `actions/test-drive.js#cancelTestDrive(bookingId)`: sets booking status to `CANCELLED` (with safety checks) and revalidates affected paths.

### Props contracts used here
- `page.jsx` passes `reservationsResult` as `initialData` to `ReservationsList`.
- `ReservationsList` expects `initialData.data` to be an array of `TestDriveBookingView` or empty/undefined.
- `TestDriveCard` receives a `booking` and optional handlers flags:
  - `onCancel(bookingId)` to trigger cancel flow
  - `showActions` (default true), `isPast`, `isCancelling`, and an optional `renderStatusSelector` (no-op in user view)

## End-to-end control flow

1) Request comes to route `app/(main)/reservations/page.jsx`.
2) Server auth: `auth()` checks Clerk. If no `userId`, redirect to `/sign-in?redirect=/reservations`.
3) Server fetch: `getUserTestDrives()` loads current user bookings with joined `car` data, newest first.
4) The page renders `<ReservationsList initialData={reservationsResult} />` inside a container with page title.
5) In the browser, `ReservationsList`:
   - If `initialData.data.length === 0`, renders an empty-state with a CTA to browse cars.
   - Else, computes groups:
     - upcoming: status in `["PENDING", "CONFIRMED"]`
     - past: status in `["COMPLETED", "CANCELLED", "NO_SHOW"]`
   - Renders upcoming as a vertical list of `TestDriveCard` items.
   - Renders past (if any) as a responsive grid of `TestDriveCard` with subdued styling.
6) Cancel flow:
   - `ReservationsList` wires `onCancel` to `cancelTestDrive` via the `useFetch` helper.
   - `TestDriveCard` shows a confirmation `Dialog`; confirming calls `onCancel(booking.id)` and disables buttons during the request.
   - On completion, the list will revalidate (server action revalidates `/reservations`), and the UI can optionally be updated optimistically if desired.

## UI anatomy and behaviors

### Empty state
- Condition: `initialData?.data?.length === 0`.
- Renders a neutral card with `Calendar` icon, guidance text, and a `Browse Cars` button linking to `/cars`.

### Upcoming bookings
- Heading: “Upcoming Test drives”. If none, shows a small italic note.
- Each row is a `TestDriveCard` with:
  - Car thumbnail (or placeholder), booking date, time range, and status badge.
  - Optional notes inside the actions column.
  - Buttons: `View Car` and, if status is `PENDING` or `CONFIRMED`, a `Cancel` button opening the confirmation dialog.

### Past bookings
- Rendered only if there are items.
- Grid layout on md+.
- `TestDriveCard` receives `isPast` to slightly fade the card.

### Status badge mapping
- `PENDING` → amber, `CONFIRMED` → green, `COMPLETED` → blue, `CANCELLED` → gray, `NO_SHOW` → red.

## Libraries and utilities used

- Clerk for authentication (`@clerk/nextjs/server`).
- Prisma via server actions in `actions/`.
- shadcn/ui for `Card`, `Dialog`, `Button`, `Badge` and layout primitives.
- `date-fns` for formatting dates and times.
- `lucide-react` icons (`Calendar`, `Clock`, `Car`, `User`).
- `sonner` toasts via `useFetch` error handling.

## Rebuild this from scratch (step-by-step)

1) Create the route folder `app/(main)/reservations/` with `page.jsx`.
2) Implement server actions in `actions/test-drive.js`:
   - `getUserTestDrives()` to return the `GetUserTestDrivesResponse` shape above.
   - `cancelTestDrive(bookingId)` with authorization and status guards, then revalidate `/reservations`.
3) In `page.jsx`:
   - `await auth()`; if no `userId`, `redirect("/sign-in?redirect=/reservations")`.
   - `const reservationsResult = await getUserTestDrives()`.
   - Render a container with a title and `<ReservationsList initialData={reservationsResult} />`.
4) Create `_components/reservations-list.jsx` as a client component:
   - Use `useFetch(cancelTestDrive)` to obtain `{ fn, loading, error }`.
   - Split bookings into `upcoming` and `past` by status.
   - Map each item to `TestDriveCard` with `onCancel`, `isCancelling`, and `showActions` flags.
   - Render the empty state when no bookings.
5) Use `components/test-drive-card.jsx` for visual presentation and the cancel confirmation dialog.
6) Style with shadcn/ui + Tailwind classes as seen in the existing components.

## Extending safely

- Add client-side optimistic removal of a cancelled booking from the list without waiting for revalidate.
- Add filters (by status or date), sort controls, and pagination if needed.
- Allow editing/rescheduling by adding a new server action and card action.
- Add iCal/Google Calendar links next to upcoming bookings.

## FAQ and common pitfalls

- Why is cancellation sometimes disabled? Completed or already-cancelled bookings cannot be cancelled; guards exist server-side.
- Why can’t another user cancel my booking? Server checks `booking.userId === currentUser.id` unless the user is an `ADMIN`.
- Why does the list not change immediately? The server action revalidates the route; you can implement optimistic UI if needed.
- Time formatting: `TestDriveCard` formats `startTime`/`endTime` into `h:mm a` via `date-fns` (`parseISO` seeded with a dummy date).

## Quality checklist

- Unauthenticated users are redirected to sign-in with a `redirect` param.
- Empty state has clear CTA to browse cars.
- Status grouping and badges reflect the actual booking state.
- Cancel flow is confirmed, guarded, and provides clear disabled/loading feedback.


