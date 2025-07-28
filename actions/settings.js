"use server";

import { dayOfWeek } from "@/lib/generated/prisma";
import { auth } from "@clerk/nextjs/server";

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
  } catch (error) {}
}
