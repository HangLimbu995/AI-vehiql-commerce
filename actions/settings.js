"use server";

import { dayOfWeek } from "@/lib/generated/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getDealershipInfo() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get the dealership record
    let dealership = await db.getDealershipInfo.findFirst({
      include: {
        workingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });

    // If no dealership exists, create a default one
    if (!dealership) {
      dealership = await db.getDealershipInfo.create({
        data: {
          // Defalt values will be used from schema
          workingHours: {
            create: [
              {
                dayOfWeek: "MONDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "TUESDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "WEDNESDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "THURSDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "FRIDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "SATURDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "SUNDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: false,
              },
            ],
          },
          include: {
            workingHours: {
              orderBy: { dayOfWeek: "asc" },
            },
          },
        },
      });
    }

    // Format the data
    return {
      success: true,
      data: {
        ...dealership,
        createdAt: dealership.createdAt.toISOString(),
        updatedAt: dealership.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    throw new Error("Error fetching dealership info:" + error.message);
  }
}

export async function saveWorkingHours(workingHours) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    const dealership = db.dealershipInfo.findFirst();

    if (!dealership) throw new Error("Dealership data not found");

    // Update working horus - first delete existing hours

    await db.workingHour.deleteMany({
      where: { dealershipId: dealership.id },
    });

    // Then create new hours
    for (let hour of workingHours) {
      await db.workingHour.create({
        data: {
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.openTime,
          isOpen: hour.isOpen,
          dealershipId: dealership.id,
        },
      });
    }

    // revalidate paths
    revalidatePath("/admin/settings");
    revalidatePath("/"); // HomePage might display hours

    return {
      success: true,
    };
  } catch (error) {
    throw new Error("Error saving working horus:" + error.message);
  }
}

// Get all users
export async function getUsers() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }
  } catch (error) {}
}
