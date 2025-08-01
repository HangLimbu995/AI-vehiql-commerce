import { getCarFilters } from "@/actions/car-listing";
import React from "react";
import CarFilters from "./_components/car-filter";

export const metadata = {
  title: "Cars || Vehiql",
  description: "Browse & Search for your dream car",
};

const CarsPage = async () => {
  const filtersData = await getCarFilters();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-6xl mb-4 gradient-title">Browse Cars</div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 flex-shrink-0">
          {/* Filters */}
          <CarFilters filters={filtersData} />
        </div>
        <div className="flex-1">{/* Listings */}</div>
      </div>
    </div>
  );
};

export default CarsPage;
async;
