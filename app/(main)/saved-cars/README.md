## Saved Cars Page — Complete Developer Guide

This folder implements the user favorites experience: server-protected page, server action to load saved cars, and a simple client grid that renders `CarCard` with wishlisted state.

If you read only this file, you should be able to rebuild the entire feature from scratch with the same behavior and UX quality.

### File map

```
app/(main)/saved-cars/
  ├─ page.jsx                  Server component: auth + fetch saved cars + render
  └─ _components/
      └─ saved-cars-list.jsx   Client component: empty state + grid of CarCard
```

### Responsibilities (at a glance)

- `page.jsx`: server-only. Requires sign-in (Clerk), fetches saved cars via `getSavedCars()`, renders the page shell and `SavedCarsList`.
- `saved-cars-list.jsx`: client-only. Renders an empty-state when the list is empty; otherwise shows a responsive grid of `CarCard`. Forces each card’s `wishlisted` flag to `true` so the heart is filled.

## Data model and contracts

### Source of truth
- Data is fetched by `actions/car-listing.js#getSavedCars()` using Prisma.
- Prisma models live in `prisma/schema.prisma` (notably `User`, `Car`, and the join table `UserSavedCar`).

### What `getSavedCars` returns (shape simplified)

```ts
type SavedCarsResponse = {
  success: boolean;
  data?: Array<Car>;
  error?: string;
}

type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;            // JS number
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  images: string[];         // public URLs
  status: "AVAILABLE" | "UNAVAILABLE" | "SOLD";
  wishlisted?: boolean;     // may be omitted by `getSavedCars`, UI forces true
}
```

Notes:
- `getSavedCars` includes cars through `userSavedCar` and serializes them via `serializecarData`. The list UI passes `{ ...car, wishlisted: true }` to `CarCard` so a filled heart renders.
- The toggle endpoint is `actions/car-listing.js#toggleSavedCar(carId)`; `CarCard` uses it for add/remove, showing an optimistic UI toast.

### Props contracts used here
- `page.jsx` passes the full `SavedCarsResponse` as `initialData` to `SavedCarsList`.
- `SavedCarsList` expects `initialData.data` to be an array of `Car` or empty/undefined.
- Each `CarCard` receives a `car` prop containing at least: `id`, `images[0]`, `make`, `model`, `price`, `year`, `transmission`, `fuelType`, `bodyType`, `mileage`, `color`, and `wishlisted`.

## End-to-end control flow

1) Request comes to route `app/(main)/saved-cars/page.jsx`.
2) Server auth: `auth()` checks Clerk. If no `userId`, redirect to `/sign-in?redirect=/saved-cars`.
3) Server fetch: `getSavedCars()` loads all cars saved by the current user, newest first.
4) The page renders `<SavedCarsList initialData={savedCarsResult} />` inside a container with page title.
5) In the browser, `SavedCarsList`:
   - If the list is empty, shows a friendly empty state with a heart icon and guidance.
   - Else, renders a grid of `CarCard` with `wishlisted: true` so the heart is filled.
6) Inside each `CarCard`, clicking the heart calls `toggleSavedCar(car.id)` via a `useFetch` helper. On success, a toast displays the server message and the local heart state toggles.

## UI anatomy and behaviors

### Empty state
- Condition: `!initialData?.data || initialData.data.length === 0`.
- Renders a neutral card with a Heart icon and guidance to browse listings.

### Grid of cards
- Responsive CSS grid: 1 column on mobile, 2 on md, 3 on lg.
- Each item is a `CarCard` that displays image, make/model, price, quick specs, and a CTA to view the car details.
- The heart button is active and reflects the saved state locally.

### CarCard behaviors (relevant subset)
- Requires sign-in to toggle favorites; otherwise shows a toast and routes to `/sign-in`.
- Calls `toggleSavedCar` with a guarded click (prevents card navigation) and shows spinner while toggling.
- On success/error, uses `sonner` toasts.

## Libraries and utilities used

- Clerk for authentication (`@clerk/nextjs/server` in `page.jsx`, `useAuth` in `CarCard`).
- Prisma via server actions in `actions/`.
- shadcn/ui for `Card`, `Button`, `Badge` and layout primitives.
- `sonner` for toasts and quick feedback on toggling.
- `lucide-react` icons (`Heart`).
- Next.js App Router (server + client components) and `next/image` for responsive images.

## Rebuild this from scratch (step-by-step)

1) Create the route folder `app/(main)/saved-cars/` with `page.jsx`.
2) Implement the server action `getSavedCars()` that returns the `SavedCarsResponse` shape above, joining `userSavedCar` and serializing the linked `car`.
3) In `page.jsx`:
   - `await auth()`; if no `userId`, `redirect("/sign-in?redirect=/saved-cars")`.
   - `const savedCarsResult = await getSavedCars()`.
   - Render a container with a title and `<SavedCarsList initialData={savedCarsResult} />`.
4) Create `_components/saved-cars-list.jsx` as a client component:
   - If empty, render the illustrated empty state.
   - Else, render a responsive grid mapping `initialData.data` to `<CarCard car={{ ...car, wishlisted: true }} />`.
5) Ensure `components/car-card.jsx` supports a `wishlisted` boolean and calls `toggleSavedCar(car.id)` when its heart is clicked.
6) Style with shadcn/ui + Tailwind classes as seen in the existing components.

## Extending safely

- Add a “Remove” button per card in this page that calls `toggleSavedCar` and removes the card from the grid optimistically.
- Add sorting (e.g., newest saved vs. price) and segment filters.
- Add skeletons for initial server render or client revalidations.
- Consider infinite scrolling if a user has many favorites.

## FAQ and common pitfalls

- Why force `wishlisted: true`? Some responses may omit this flag; forcing it ensures the filled-heart UI without relying on server shape nuances.
- Why server-protect the route? Favorites are per-user; rendering without auth would just redirect anyway.
- Image missing? `CarCard` expects `images[0]`; ensure your serializer always supplies at least a placeholder URL or handle gracefully.
- Currency formatting: `CarCard` uses `toLocaleString()` for price and mileage; localize if needed.

## Quality checklist

- Unauthenticated users are redirected to sign-in with a `redirect` param.
- Empty state reads clearly and suggests the next step.
- Cards render consistently with correct wishlisted state.
- Toggling favorites shows clear feedback (spinner + toast) and prevents accidental navigation.


