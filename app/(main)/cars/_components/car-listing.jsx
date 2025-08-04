"use client";

import { getCars } from "@/actions/cars";
import useFetch from "@/hooks/use-fetch";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

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

  const [currentPage, setCurrentPage] = useState(page)

  const {
    loading, fn: fetchCars, data: result, error} = useFetch(getCars)
  

  return <div>CarListings</div>;
};

export default CarListings;
