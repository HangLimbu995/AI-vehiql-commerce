### Build a mental model (beginner friendly)

Think of this page as three simple layers working together:

1) Data layer (server): fetch one car from the database.
2) Page shell (server): put that car into the page layout.
3) UI widgets (client): show details and run the EMI math in the browser.

```
app/(main)/cars/[id]/
  ├─ page.jsx                 ← server: fetch one car and render
  └─ _components/
      ├─ car-details.jsx      ← client: gallery/specs and actions
      └─ emi-calculator.jsx   ← client: sliders + EMI math
```

### How the data flows

- `page.jsx` calls `getCarById(id)` (server action) and passes the result to `CarDetails`.
- `car-details.jsx` shows the car info and opens a dialog with `EMICalculator`.
- `emi-calculator.jsx` receives `price`, `image`, `title` as props and calculates the payment numbers live.

### Where the data comes from (API/database)

- `actions/car-listing.js` (server): uses Prisma to query the PostgreSQL database.
  - `getCarById(id)` → `db.car.findUnique({ where: { id } })` and some related info.
  - Result is cleaned with `serializecarData()` (`lib/helper.js`) so numbers/dates are easy to use in React.
- Prisma client is configured in `lib/prisma.js`. Tables and fields are defined in `prisma/schema.prisma` (see models: `Car`, `User`, `UserSavedCar`, etc.).

### The most important functions (in plain English)

- `serializecarData(car, wishlisted)`
  - Turns database types into simple JS types and adds a boolean flag `wishlisted`.

- `formatCurrency(amount)`
  - Displays numbers like `$12,345.67`. Change the currency or locale here.

- `calculateMonthlyPayment(principal, annualInterestRate, totalMonths, downPayment)` (used in `car-details.jsx` for a quick preview)
  - Calculates a monthly payment. If interest is zero, it’s just `principal / months`.

- `EMICalculator` math (in `emi-calculator.jsx`)
  - Financed amount: `P = max(price - downPayment, 0)`
  - Monthly rate: `r = (APR / 100) / 12`
  - Months: `n`
  - EMI: if `r > 0`, `EMI = P * r * (1+r)^n / ((1+r)^n - 1)`; otherwise `EMI = P / n`
  - Total Payment: `EMI * n`

### What each slider/input controls

- Down Payment: money paid upfront; increases → loan goes down.
- Loan Amount: derived as `price - downPayment` (kept in sync with Down Payment).
- Interest Rate (APR): percent per year; higher APR → higher EMI.
- Loan Tenure (Months): how long you pay; more months → smaller EMI but more total interest.

### Minimal “build your own” guide

1) Server action (fetch one car)

```js
// actions/get-car.js
"use server";
import { db } from "@/lib/prisma";
export async function getCarById(id) {
  const car = await db.car.findUnique({ where: { id } });
  return car; // serialize like this repo does for numbers/dates
}
```

2) Route file (server)

```jsx
// app/cars/[id]/page.jsx
import { getCarById } from "@/actions/get-car";
import CarDetails from "./_components/car-details";
export default async function Page({ params }) {
  const car = await getCarById(params.id);
  return <CarDetails car={car} />;
}
```

3) Client details component

```jsx
// app/cars/[id]/_components/car-details.jsx
"use client";
import EMICalculator from "./emi-calculator";
export default function CarDetails({ car }) {
  return <EMICalculator price={car.price} image={car.images?.[0]} title={`${car.year} ${car.make} ${car.model}`} />;
}
```

4) EMI calculator core (client)

```jsx
// app/cars/[id]/_components/emi-calculator.jsx
"use client";
// keep state: downPayment, apr, months
// compute financed = price - downPayment, then EMI using the formula above
```

That’s the whole flow: server fetch → pass props → render UI → compute EMI in the browser.

### Style and libraries used here

- Next.js App Router (server + client components).
- Prisma + PostgreSQL for data; Clerk auth is used for wishlist toggling.
- shadcn/ui components and TailwindCSS for styling.
- `next/image` for optimized images.

### Tips for beginners

- Keep server logic (database queries) in server actions; pass plain props to client components.
- Start with one value and one slider. Once it works, add the others.
- Use small helper functions (`clamp`, `formatCurrency`) to keep UI code clean.
- Test the EMI math in isolation with a few known values (e.g., 0% APR, 12 months) to build confidence.

