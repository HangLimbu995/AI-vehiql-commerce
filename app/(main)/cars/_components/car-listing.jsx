"use client";

import { getCars } from "@/actions/car-listing";
import CarCard from "@/components/car-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { Info } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const CarListings = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const limit = 6;

  //   Extract filter values form searchParams
  const search = searchParams.get("search") || "";
  const make = searchParams.get("make") || "";
  const fuelType = searchParams.get("fuelType") || "";
  const bodyType = searchParams.get("bodyType") || "";
  const transmission = searchParams.get("transmission") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const [currentPage, setCurrentPage] = useState(page);

  const { loading, fn: fetchCars, data: result, error } = useFetch(getCars);

  useEffect(() => {
    fetchCars({
      search,
      make,
      bodyType,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
    });
  }, [
    search,
    make,
    bodyType,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    sortBy,
    page,
  ]);

  useEffect(() => {
    // Only push when the desired page differs from the current URL param
    if (currentPage === page) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", currentPage.toString());
    // Preserve existing query params (filters, search, sort) while changing page
    router.push(`?${params.toString()}`);
  }, [currentPage, page, searchParams, router]);

  if (error || !result || !result?.success) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load cars. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!result || !result.data) {
    return null;
  }
let cars, pagination;
  if (result?.success) {
     cars = result?.success ? result.data : [];
     pagination = result?.success ? result.pagination : [];
  }

  console.log('cars is ', cars)

  if (cars.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Info className="h-8 w-8 text-gray-500" />
        </div>

        <h3 className="text-lg font-medium mb-2">No cars found</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          We could't find any matching your search criteria. Try adjusting your
          filters or search term.
        </p>
        <Button variant="outline" asChild>
          <Link href="/cars">Clear all Filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing{" "}
          <span className="font-medium">
            {(page - 1) * limit + 1} -{" "}
            {Math.min(page * limit, pagination.total)}
          </span>{" "}
          of <span className="font-medium">{pagination.total}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </div>
  );
};

export default CarListings;
