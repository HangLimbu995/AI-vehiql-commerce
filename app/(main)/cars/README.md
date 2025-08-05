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