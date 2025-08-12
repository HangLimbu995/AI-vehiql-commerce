## Car Details Page — Complete Developer Guide

This folder implements the product detail experience for a single car: data fetch, detail view, wishlisting, sharing, “Book Test Drive” entry point, and an interactive EMI calculator. It is designed to be readable, extensible, and production-ready.

If you read only this file, you should be able to rebuild the entire feature from scratch with the same behavior and UX quality.

### File map

```
app/(main)/cars/[id]/
  ├─ page.jsx                 Server component: fetches data, sets SEO, renders page
  └─ _components/
      ├─ car-details.jsx      Client component: gallery, specs, wishlist/share, test-drive CTA
      └─ emi-calculator.jsx   Client component: interactive loan math + sliders
```

### Responsibilities (at a glance)

- page.jsx: server-only. Loads the car via `getCarById`, sets metadata, and renders `CarDetails`.
- car-details.jsx: client-only. Renders images, price/specs, wishlist/share actions, EMI dialog, dealer info, and the “Book Test Drive” button.
- emi-calculator.jsx: client-only. Provides an interactive loan estimate with safe clamping and live calculations.

## Data model and contracts

### Source of truth
- Data is fetched by `actions/car-listing.js#getCarById(id)` using Prisma.
- Prisma models live in `prisma/schema.prisma` (notably the `Car` model). The action also includes derived info like `testDriveInfo`.

### What `getCarById` returns (shape simplified)

```ts
type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;            // serialized to JS number
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  seats?: number | null;
  description: string;
  color: string;
  images: string[];         // public URLs
  status: "AVAILABLE" | "UNAVAILABLE" | "SOLD";
  wishlisted: boolean;      // user-specific
  testDriveInfo: {
    userTestDrive: {
      id: string;
      status: "PENDING" | "CONFIRMED" | "COMPLETED";
      bookingDate: string;  // ISO
    } | null;
    dealership: {
      name: string;
      address: string;
      phone: string;
      email: string;
      workingHours: Array<{
        dayOfWeek: "MONDAY"|"TUESDAY"|"WEDNESDAY"|"THURSDAY"|"FRIDAY"|"SATURDAY"|"SUNDAY";
        openTime: string;   // "HH:MM"
        closeTime: string;  // "HH:MM"
        isOpen: boolean;
      }>;
    } | null;
  };
};
```

### Props contracts used here
- `page.jsx` passes `result.data` (the `Car`) and its nested `testDriveInfo` directly to `CarDetails`.
- `CarDetails` passes three props to the EMI dialog: `price`, `image`, `title`.

## End-to-end control flow

1) Request comes to route `app/(main)/cars/[id]/page.jsx`.
2) Server fetch: `getCarById(id)` loads the specific car and associated info.
3) `generateMetadata` sets contextual SEO (title/description/OG image) based on loaded car data.
4) The page renders `<CarDetails car={result.data} testDriveInfo={result.data.testDriveInfo} />`.
5) In the browser, `CarDetails` manages UI interactions: gallery, wishlist toggle, sharing, and the “Book Test Drive” navigation to `/test-drive/[id]`.
6) Opening the EMI dialog renders `EMICalculator` with live calculations.

## UI anatomy and behaviors

### Gallery
- Uses `next/image` for the primary image and a strip of thumbnails.
- Clicking a thumbnail updates `currentImageIndex`.
- Fallback: when no images, shows a car icon inside a neutral placeholder.

### Price and specs
- Price uses `formatCurrency` for locale-aware display.
- Key specs: mileage, fuel type, transmission; plus description, features, and detailed specs grid.

### Wishlist (favorites)
- Requires sign-in (checked via Clerk’s `useAuth`). If not signed in, routes to `/sign-in`.
- Invokes `actions/car-listing.js#toggleSavedCar(car.id)` via a small `useFetch` helper.
- On success, toggles local UI state and shows a toast.

### Share
- Uses the Web Share API when available; falls back to copying the current URL to clipboard with a success toast.

### Book Test Drive
- Disabled when the car is `SOLD`/`UNAVAILABLE` or when the user already has a `userTestDrive` for this car.
- Navigates to `/test-drive/{car.id}`; that route handles date/time selection and booking persistence.

### Dealer info
- Displays name, address, contact info and normalized weekly working hours.
- If the dealership record is absent, the UI shows sensible defaults.

## EMI calculator (loan math)

Inputs and state:
- Price (pre-filled from car), Down payment, APR, Months.

Derived values and formulas:
- Financed amount: `P = max(price - downPayment, 0)`
- Monthly rate: `r = (APR / 100) / 12`
- Months: `n`
- EMI:
  - If `r > 0`: `EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)`
  - Else: `EMI = P / n`
- Total Payment: `EMI * n`
- Total Interest: `max(Total Payment - P, 0)`

Engineering details:
- Inputs are clamped with a small helper to keep values in safe ranges (e.g., down payment never above price, months within [6, 96], APR within [0, 25]).
- Sliders and inputs stay in sync; changing “Loan Amount” slider recalculates down payment accordingly.

Tuning points:
- Change default APR/months in `emi-calculator.jsx` (state initialization).
- Adjust slider ranges/steps to match local financing norms.

## Error states and resilience

- Server-side: if `getCarById` fails, `page.jsx` calls `notFound()` to render the global 404.
- Client-side fallbacks:
  - No images → icon placeholder.
  - Car status `SOLD`/`UNAVAILABLE` → destructive `Alert` with disabled booking.
  - Not signed in → toast + push to `/sign-in` for actions (wishlist, booking).
  - Dealership absent → defaults in the working-hours list.

## SEO and accessibility

- `generateMetadata` sets page title, description, and Open Graph image when available.
- Primary image includes an `alt` that concatenates `year`, `make`, `model`.
- Interactive elements include clear labels and icons from `lucide-react`.

## Libraries and utilities used

- Next.js App Router: server and client components together.
- Prisma + PostgreSQL via server actions under `actions/`.
- Clerk for authentication (`useAuth`) to gate wishlist/booking.
- shadcn/ui for consistent UI primitives (Button, Dialog, Card, Badge, Alert, Slider, etc.).
- `next/image` for responsive, optimized images.
- `date-fns` for formatting dates in the “Booked” state.
- `sonner` toasts for quick feedback.

## Rebuild this from scratch (step-by-step)

1) Create the route folder `app/(main)/cars/[id]/` with `page.jsx`.
2) Implement a server action `getCarById(id)` that returns the `Car` shape above (serialize Prisma results to plain JS types where needed).
3) In `page.jsx`:
   - `await getCarById(params.id)`
   - If unsuccessful, `notFound()`.
   - `generateMetadata` using the loaded car data.
   - Render `<CarDetails car={car} testDriveInfo={car.testDriveInfo} />`.
4) Create `_components/car-details.jsx` as a client component:
   - Local state: wishlist flag, current image index.
   - Render gallery with thumbnails and fallbacks.
   - Show price, specs, description, features, and a specs grid.
   - Use a `Dialog` to host `<EMICalculator price={car.price} image={car.images?.[0]} title={`${car.year} ${car.make} ${car.model}`} />`.
   - Buttons: Save (toggles via server action), Share (Web Share → clipboard fallback), Book Test Drive (push to `/test-drive/${car.id}`).
   - Dealer section with working hours list.
5) Create `_components/emi-calculator.jsx` as a client component:
   - State: `price`, `downPayment`, `apr`, `months`.
   - Sliders + numeric inputs with clamping.
   - Compute EMI using the formula above and show summary (EMI, Total Payment, optional Total Interest).
6) Wire styles with shadcn/ui + Tailwind.
7) Ensure Clerk is configured so wishlist/booking flows can check `isSignedIn`.

## Extending safely

- Add financing presets (36/48/60/72 months) as quick buttons.
- Persist a user’s last used APR/tenure in localStorage for convenience.
- Track analytics when users open EMI dialog or click “Apply”.
- Add a comparison table for multiple down-payment scenarios.
- Defer-load the EMI dialog (dynamic import) if performance becomes a concern.

## FAQ and common pitfalls

- Why are prices and dates “already JS-friendly”? The server action uses a serializer (`serializecarData`) to convert Prisma types to plain JS numbers/strings.
- Why is booking disabled sometimes? The car can be `SOLD`/`UNAVAILABLE`, or the user already has an active/completed booking.
- Web Share API fails in some browsers — we automatically fall back to copying the URL.
- Working hours may be absent — UI shows reasonable defaults.

## Quality checklist

- Server errors yield a proper 404 via `notFound()`.
- Images have descriptive `alt` text and responsive sizing.
- Buttons are keyboard-accessible; toasts confirm actions.
- All volatile inputs in the EMI calculator are validated/clamped.

With this guide, you can confidently re-create or extend the car detail experience, understanding each moving part and the contracts that tie them together.

