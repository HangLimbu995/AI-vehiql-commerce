"use server";

import { db } from "@/lib/prisma";

// Get simplified filters for the car marketplace
export async function getCarFilters() {
  try {
    let where = { status: "AVAILABLE" };

    // Get Unique makes
    const makes = await db.car.findMany({
      where,
      select: { make: true },
      distinct: ["make"],
      orderBy: { make: "asc" },
    });

    //  Get unique boty types
    const bodyTypes = await db.car.findMany({
      where,
      select: {
        bodyType: true,
      },
      distinct: ["bodyType"],
      orderBy: { bodyType: "asc" },
    });

    // Get Unique fuel types
    const fuelTypes = await db.car.findMany({
      where,
      select: { fuelType: true },
      distinct: ["fuelType"],
      orderBy: { fuelType: "asc" },
    });

    // Get unique transmission types
    const transmissions = await db.car.findMany({
      where,
      select: { transmission: true },
      distinct: ["transmission"],
      orderBy: { transmission: "asc" },
    });

    // Get min and max prices using Prisma aggregations
    const priceAggregations = await db.car.aggregate({
      where,
      _min: { price: true },
      _max: { price: true },
    });

    return {
      success: true,
      data: {
        make: makes.map((item) => item.make),
        bodyTypes: bodyTypes.map((item) => item.bodyType),
        fuelTypes: fuelTypes.map((item) => item.fuelType),
        transmissions: transmissions.map((item) => item.transmission),
        priceRange: {
          min: priceAggregations._min.price
            ? parseFloat(priceAggregations._min.price.toString())
            : 0,
          max: priceAggregations._max.price
            ? parseFloat(priceAggregations._max.price.toString())
            : 100000,
        },
      },
    };
  } catch (error) {
    throw new Error("Error fetching car filters:" + error.message);
  }
}
