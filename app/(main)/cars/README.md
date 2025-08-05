# Car Browsing Module

This module handles the display, filtering, and listing of cars.

## `app/(main)/cars/page.jsx`

This is the main page for browsing cars. It fetches initial filter data and renders the `CarFilters` and `CarListings` components.

## `app/(main)/cars/_components/car-filter.jsx`

This component provides the UI for filtering cars based on various criteria such as make, body type, fuel type, transmission, and price range. It manages the filter state and updates the URL search parameters to reflect the selected filters. It also handles clearing individual or all filters.

## `app/(main)/cars/_components/car-listing.jsx`

This component displays a list of cars. It fetches car data based on the current URL search parameters (filters, search term, pagination) and renders `CarCard` components for each car. It also handles the "No cars found" state and displays pagination information.

## `app/(main)/cars/_components/filter-controls.jsx`

This component renders the individual filter controls used within the `CarFilters` component. It provides UI elements like sliders for price range and badges for selecting car attributes (make, fuel type, etc.), and handles the interaction with these controls.

## Data Flow and Variables

The data flow in this module primarily revolves around URL search parameters and a custom `useFetch` hook.

### `app/(main)/cars/_components/car-listing.jsx` - Variables and Data Fetching:

*   **URL Parameters as State:**
    *   `searchParams`: (from `next/navigation`) Provides access to the current URL query parameters.
    *   `search`, `make`, `fuelType`, `bodyType`, `transmission`, `minPrice`, `maxPrice`, `sortBy`, `page`: These variables directly extract their values from `searchParams`. They represent the active filters and pagination criteria.
*   **Local State:**
    *   `limit`: A constant (6) defining the number of cars per page.
    *   `currentPage`: A `useState` variable, initialized from the `page` URL parameter, managing the current page for pagination. An `useEffect` hook keeps the URL's `page` parameter synchronized with `currentPage`.
*   **Data Fetching with `useFetch` Hook:**
    *   `loading`: A boolean indicating if data is currently being fetched.
    *   `fn: fetchCars`: The function provided by `useFetch` to trigger data fetching.
    *   `data: result`: The response from the `getCars` action, containing `success` (boolean), `data` (array of car objects), and `pagination` (object with total count).
    *   `error`: Any error object returned during the data fetching process.
    *   **How `getCars` is fetched from actions:** The `getCars` function is imported from `@/actions/car-listing`. It's a server action that takes an object of filter parameters (like `search`, `make`, `bodyType`, etc., and `page`, `limit`) as arguments. This action then performs the necessary logic (e.g., database queries) to retrieve the filtered and paginated car data. The `useFetch` hook then wraps this `getCars` action, providing loading, data, and error states for the component. An `useEffect` hook in `car-listing.jsx` calls `fetchCars` whenever any of the relevant URL parameters change, ensuring the car list is dynamically updated.
*   **Rendered Data:**
    *   `cars`: An array of car objects, extracted from `result.data` when `result.success` is true. This array is mapped to render individual `CarCard` components.
    *   `pagination`: An object containing pagination details, such as `total` (total number of cars matching the filters), extracted from `result.pagination`.

## Data Keys (URL Search Parameters)

The car browsing module heavily relies on URL search parameters to manage the state of filters and pagination. These parameters act as "data keys" that are read from and written to the URL, allowing for shareable and persistent filtering. Here are some of the main data keys used:

*   `search`: (string, optional) Used for a general text search across car details. 
    *   **Example:** `/cars?search=honda` would search for cars matching "honda".
*   `make`: (string, optional) Filters cars by their manufacturer.
    *   **Example:** `/cars?make=Toyota` would show only Toyota cars.
*   `bodyType`: (string, optional) Filters cars by their body style (e.g., sedan, SUV).
    *   **Example:** `/cars?bodyType=SUV` would display only SUV-type cars.
*   `fuelType`: (string, optional) Filters cars by the type of fuel they use.
    *   **Example:** `/cars?fuelType=Petrol` would show cars running on petrol.
*   `transmission`: (string, optional) Filters cars by their transmission type.
    *   **Example:** `/cars?transmission=Automatic` would filter for automatic transmission cars.
*   `minPrice`: (number, optional) Sets the minimum price for filtered cars.
    *   **Example:** `/cars?minPrice=10000` would display cars costing $10,000 or more.
*   `maxPrice`: (number, optional) Sets the maximum price for filtered cars.
    *   **Example:** `/cars?maxPrice=50000` would show cars costing up to $50,000.
*   `sortBy`: (string, optional) Determines the order in which cars are displayed. Common values include `newest`, `priceAsc` (price ascending), `priceDesc` (price descending).
    *   **Example:** `/cars?sortBy=priceAsc` would sort cars from the lowest to the highest price.
*   `page`: (number, optional) Specifies the current page number for pagination.
    *   **Example:** `/cars?page=2` would show cars on the second page of results.

### How They Work:

1.  **Reading:** When the `car-listing.jsx` and `car-filter.jsx` components load, they read these data keys from the `URLSearchParams` object to initialize their internal states.
2.  **Updating:** When a user interacts with the filters (e.g., selects a make, adjusts the price slider), the `car-filter.jsx` component updates these data keys in the URL using `router.push()`. This triggers a re-fetch of car data in `car-listing.jsx`.
3.  **Persistence and Sharing:** Because these parameters are in the URL, the filtered state of the car listing is persistent (e.g., if the user refreshes the page) and easily shareable (e.g., by copying and pasting the URL).

### Core APIs for URL Parameters:

*   `useSearchParams` (from `next/navigation`):
    *   **What it is:** A React Hook provided by Next.js that allows functional components to read the current URL's query string parameters. It provides a `URLSearchParams` object that is always up-to-date with the URL.
    *   **How it works:** When the URL's query parameters change, `useSearchParams` triggers a re-render of the component, allowing the UI to reflect the new filter state.
    *   **Example (reading parameters):**
        ```javascript
        const searchParams = useSearchParams();
        const make = searchParams.get("make") || "";
        const minPrice = parseInt(searchParams.get("minPrice") || "0");
        ```

*   `URLSearchParams` (Web API):
    *   **What it is:** A built-in Web API interface that defines utility methods to work with the query string of a URL. It allows for easy manipulation (adding, deleting, getting, setting) of individual parameters within a URL's query string.
    *   **How it works:** It's used in conjunction with `router.push()` (from `next/navigation`) to construct new URLs with updated filter parameters.
    *   **Example (constructing new URL):**
        ```javascript
        const params = new URLSearchParams();
        if (make) params.set("make", make);
        if (minPrice) params.set("minPrice", minPrice.toString());
        const queryString = params.toString(); // e.g., "make=Toyota&minPrice=10000"
        router.push(`/cars?${queryString}`);
        ```